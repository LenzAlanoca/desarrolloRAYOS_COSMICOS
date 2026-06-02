const pool = require('../config/database');
const logsService = require('../services/logs.service');

// GET /api/logs - Obtener todos los logs del detector + datos de la BDD
const getAllLogs = async (req, res) => {
  try {
    // Obtener logs disponibles en el servidor detector
    const detectorLogs = await logsService.listDetectorLogs();
    
    // Obtener datos de la BDD
    const deviceQuery = await pool.query(
      `SELECT d.*, t.nombre as tipo_nombre, e.nombre as estacion_nombre
       FROM dispositivo d
       JOIN tipo_dispositivo t ON d.id_tipo = t.id_tipo
       JOIN estacion e ON d.id_estacion = e.id_estacion
       WHERE d.codigo_hardware = '0x2F1'`
    );
    
    const device = deviceQuery.rows[0];
    
    // Obtener archivos importados en la BDD
    const archivosQuery = await pool.query(
      `SELECT * FROM archivo_log 
       WHERE id_dispositivo = $1 
       ORDER BY fecha_importacion DESC LIMIT 100`,
      [device?.id_dispositivo]
    );
    
    // Obtener variables del detector
    const variablesQuery = await pool.query(
      `SELECT * FROM variable_medida 
       WHERE id_tipo = $1 
       ORDER BY posicion_columna ASC`,
      [device?.id_tipo]
    );
    
    res.json({
      device: {
        id: device?.id_dispositivo,
        codigo: device?.codigo_hardware,
        nombre: device?.nombre,
        modelo: device?.modelo,
        estacion: device?.estacion_nombre,
        estado: device?.estado_actual,
        activo: device?.activo,
      },
      variables: variablesQuery.rows.map(v => ({
        id: v.id_variable,
        nombre: v.nombre,
        unidad: v.unidad,
        posicion: v.posicion_columna,
        descripcion: v.descripcion,
      })),
      archivosEnBDD: archivosQuery.rows.map(a => ({
        id: a.id_archivo,
        nombre: a.nombre_archivo,
        fecha_importacion: a.fecha_importacion,
        ruta: a.ruta_archivo,
      })),
      archivosEnDetector: detectorLogs.map(log => ({
        nombre: log.nombre,
        tamano_bytes: log.tamaño,
        lineas_estimadas: log.lineas,
        modificado: log.modificado,
      })),
      total_archivos_detector: detectorLogs.length,
    });
  } catch (error) {
    console.error('Error en getAllLogs:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/logs/:fileName - Obtener contenido de un archivo específico
const getLogContent = async (req, res) => {
  try {
    const { fileName } = req.params;
    
    if (!fileName.endsWith('.log')) {
      return res.status(400).json({ error: 'Archivo debe ser .log' });
    }
    
    const content = await logsService.readDetectorLog(fileName);
    const lines = content.split('\n').filter(l => l.trim());
    
    const parsedEvents = lines.map((line, idx) => {
      const parsed = logsService.parseDetectorLine(line);
      return parsed ? { linea: idx + 1, ...parsed } : null;
    }).filter(Boolean);
    
    res.json({
      archivo: fileName,
      total_eventos: parsedEvents.length,
      eventos: parsedEvents.slice(0, 50), // Primeros 50 eventos
      _nota: 'Devuelve los primeros 50 eventos. Para importar a BDD usar /api/logs/import/:fileName',
    });
  } catch (error) {
    console.error('Error en getLogContent:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/logs/import/:fileName - Importar log a la BDD (futuro)
const importLogToDB = async (req, res) => {
  try {
    const { fileName } = req.params;
    
    res.json({
      message: 'Endpoint de importación preparado',
      fileName: fileName,
      estado: 'PREPARADO',
      descripcion: 'En futuro: Leerá el log, parseará eventos y almacenará en BD',
    });
  } catch (error) {
    console.error('Error en importLogToDB:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/logs/aggregate/:fileName - Agregados e interpretación acumulada
const getLogAggregates = async (req, res) => {
  try {
    const { fileName } = req.params;
    if (!fileName.endsWith('.log')) return res.status(400).json({ error: 'Archivo debe ser .log' });

    const content = await logsService.readDetectorLog(fileName);
    const lines = content.split('\n').filter(l => l.trim());

    const stats = {
      total_eventos: 0,
      por_variable: {},
    };

    for (const line of lines) {
      const parsed = logsService.parseDetectorLine(line);
      if (!parsed) continue;
      stats.total_eventos += 1;
      // incrementar stats por variable
      for (const [key, value] of Object.entries(parsed)) {
        if (key === 'timestamp') continue;
        if (!stats.por_variable[key]) {
          stats.por_variable[key] = { count: 0, sum: 0, min: null, max: null };
        }
        const v = Number(value);
        const s = stats.por_variable[key];
        s.count += 1;
        if (!Number.isNaN(v)) {
          s.sum += v;
          s.min = s.min === null ? v : Math.min(s.min, v);
          s.max = s.max === null ? v : Math.max(s.max, v);
        }
      }
    }

    // calcular promedios
    const por_variable_final = {};
    for (const [k, v] of Object.entries(stats.por_variable)) {
      por_variable_final[k] = {
        count: v.count,
        sum: v.sum,
        min: v.min,
        max: v.max,
        avg: v.count > 0 ? (v.sum / v.count) : null,
      };
    }

    res.json({ archivo: fileName, total_eventos: stats.total_eventos, medidas: por_variable_final });
  } catch (error) {
    console.error('Error en getLogAggregates:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/logs/pivot/:fileName - Devuelve arreglo pivotado de medidas (lista de variables)
const getLogPivot = async (req, res) => {
  try {
    const { fileName } = req.params;
    if (!fileName.endsWith('.log')) return res.status(400).json({ error: 'Archivo debe ser .log' });

    const content = await logsService.readDetectorLog(fileName);
    const lines = content.split('\n').filter(l => l.trim());

    const stats = {};
    let total = 0;
    for (const line of lines) {
      const parsed = logsService.parseDetectorLine(line);
      if (!parsed) continue;
      total += 1;
      for (const [key, value] of Object.entries(parsed)) {
        if (key === 'timestamp') continue;
        if (!stats[key]) stats[key] = { count: 0, sum: 0, min: null, max: null };
        const v = Number(value);
        const s = stats[key];
        s.count += 1;
        if (!Number.isNaN(v)) {
          s.sum += v;
          s.min = s.min === null ? v : Math.min(s.min, v);
          s.max = s.max === null ? v : Math.max(s.max, v);
        }
      }
    }

    // Convertir a array pivotado
    const medidasArray = Object.entries(stats).map(([k, v]) => ({
      variable: k,
      count: v.count,
      sum: v.sum,
      min: v.min,
      max: v.max,
      avg: v.count > 0 ? (v.sum / v.count) : null,
    }));

    res.json({ archivo: fileName, total_eventos: total, medidas: medidasArray });
  } catch (error) {
    console.error('Error en getLogPivot:', error);
    res.status(500).json({ error: error.message });
  }
};

// SSE stream para notificaciones de nuevos logs
const streamLogs = async (req, res) => {
  // habilitar SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  // enviar comentario inicial
  res.write(': connected\n\n');

  const handleNew = (file) => {
    try {
      res.write(`event: newlog\n`);
      res.write(`data: ${JSON.stringify(file)}\n\n`);
    } catch (e) {
      // ignore
    }
  };

  // suscribir al emitter
  logsService.emitter.on('newLog', handleNew);

  // cuando el cliente cierre, remover listener
  req.on('close', () => {
    logsService.emitter.removeListener('newLog', handleNew);
  });
};

// SSE stream para un archivo específico: envía estado inicial y luego líneas nuevas conforme el archivo crece
const streamLogFile = async (req, res) => {
  try {
    const { fileName } = req.params;
    if (!fileName || !fileName.endsWith('.log')) return res.status(400).json({ error: 'Archivo debe ser .log' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders && res.flushHeaders();

    res.write(': connected to file stream\n\n');

    let lastCount = 0;
    let closed = false;

    // enviar snapshot inicial
    const sendInitial = async () => {
      try {
        const content = await logsService.readDetectorLog(fileName);
        const lines = content.split('\n').filter(l => l.trim());
        const parsed = lines.map((line, idx) => logsService.parseDetectorLine(line)).filter(Boolean);
        // enviar los últimos 50 como init
        const tail = parsed.slice(-50);
        res.write(`event: init\n`);
        res.write(`data: ${JSON.stringify(tail)}\n\n`);
        lastCount = parsed.length;
      } catch (e) {
        // enviar error por SSE
        try { res.write(`event: error\n`); res.write(`data: ${JSON.stringify({ message: e.message })}\n\n`); } catch (err) {}
      }
    };

    await sendInitial();

    const interval = setInterval(async () => {
      if (closed) return;
      try {
        const content = await logsService.readDetectorLog(fileName);
        const lines = content.split('\n').filter(l => l.trim());
        const parsed = lines.map((line, idx) => logsService.parseDetectorLine(line)).filter(Boolean);
        if (parsed.length > lastCount) {
          const newItems = parsed.slice(lastCount);
          for (const item of newItems) {
            try {
              res.write(`event: line\n`);
              res.write(`data: ${JSON.stringify(item)}\n\n`);
            } catch (e) {
              // ignore write errors
            }
          }
          lastCount = parsed.length;
        }
      } catch (e) {
        // ignore polling read errors but notify client once
        try { res.write(`event: error\n`); res.write(`data: ${JSON.stringify({ message: e.message })}\n\n`); } catch (err) {}
      }
    }, 1500);

    req.on('close', () => {
      closed = true;
      clearInterval(interval);
    });

  } catch (error) {
    console.error('Error en streamLogFile:', error);
    try { res.status(500).json({ error: error.message }); } catch (e) {}
  }
};

// SSE que agrega líneas de todos los archivos y emite eventos por cada línea nueva
const streamAllFiles = async (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders && res.flushHeaders();

    res.write(': connected to all-files stream\n\n');

    let lastCounts = new Map();
    let closed = false;

    // snapshot inicial: leer todos los archivos y construir lista de eventos (misma forma que "Muestra")
    const buildInitialEvents = async () => {
      try {
        const files = await logsService.listDetectorLogs();
        const allEvents = [];
        for (const f of files) {
          try {
            const content = await logsService.readDetectorLog(f.nombre);
            const lines = content.split('\n').filter(l => l.trim());
            const parsed = lines.map((l, idx) => ({
              file: f.nombre,
              linea: idx + 1,
              ...logsService.parseDetectorLine(l)
            })).filter(e => e && e.timestamp);
            lastCounts.set(f.nombre, parsed.length);
            // keep most recent per file at end
            allEvents.push(...parsed.map(p => ({ file: p.file, linea: p.linea, ...p })));
          } catch (err) {
            // ignore per-file read errors
          }
        }
        // ordenar por timestamp si existe (suponiendo formato legible), y quedarnos con los 200 más recientes
        allEvents.sort((a, b) => {
          const ta = new Date(a.timestamp).getTime() || 0;
          const tb = new Date(b.timestamp).getTime() || 0;
          return tb - ta;
        });
        const recent = allEvents.slice(0, 200);
        res.write(`event: init\n`);
        res.write(`data: ${JSON.stringify(recent)}\n\n`);
      } catch (e) {
        try { res.write(`event: error\n`); res.write(`data: ${JSON.stringify({ message: e.message })}\n\n`); } catch (err) {}
      }
    };

    await buildInitialEvents();

    const interval = setInterval(async () => {
      if (closed) return;
      try {
        const files = await logsService.listDetectorLogs();
        for (const f of files) {
          try {
            const content = await logsService.readDetectorLog(f.nombre);
            const lines = content.split('\n').filter(l => l.trim());
            const parsed = lines.map(l => logsService.parseDetectorLine(l)).filter(Boolean);
            const prev = lastCounts.get(f.nombre) || 0;
            if (parsed.length > prev) {
              const newItems = parsed.slice(prev);
              for (const [i, item] of newItems.entries()) {
                try {
                  // incluir linea relativa
                  const payload = { file: f.nombre, linea: prev + i + 1, ...item };
                  res.write(`event: line\n`);
                  res.write(`data: ${JSON.stringify(payload)}\n\n`);
                } catch (e) {}
              }
              lastCounts.set(f.nombre, parsed.length);
            }
          } catch (err) {
            // per-file read error -> notify once
            try { res.write(`event: error\n`); res.write(`data: ${JSON.stringify({ message: err.message, file: f.nombre })}\n\n`); } catch (e) {}
          }
        }
      } catch (e) {
        try { res.write(`event: error\n`); res.write(`data: ${JSON.stringify({ message: e.message })}\n\n`); } catch (err) {}
      }
    }, 1500);

    req.on('close', () => {
      closed = true;
      clearInterval(interval);
    });

  } catch (error) {
    console.error('Error en streamAllFiles:', error);
    try { res.status(500).json({ error: error.message }); } catch (e) {}
  }
};

// Endpoint de desarrollo para disparar un evento newLog (solo dev)
const triggerNewLog = async (req, res) => {
  try {
    const sample = req.body && Object.keys(req.body).length ? req.body : {
      nombre: `DEV_NEW_${Date.now()}.log`,
      tamano: 123,
      modificado: new Date(),
      lineas: 1,
    };
    logsService.emitter.emit('newLog', sample);
    res.json({ triggered: true, sample });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
  getAllLogs,
  getLogContent,
  importLogToDB,
  getLogAggregates,
  getLogPivot,
  streamLogs,
  streamLogFile,
  streamAllFiles,
  triggerNewLog,
};
