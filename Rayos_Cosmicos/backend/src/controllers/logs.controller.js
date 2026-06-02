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
        tamaño_bytes: log.tamaño,
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

module.exports = {
  getAllLogs,
  getLogContent,
  importLogToDB,
};
