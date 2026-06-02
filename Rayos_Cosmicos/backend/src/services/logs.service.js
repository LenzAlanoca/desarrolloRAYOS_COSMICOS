const { Client } = require('ssh2');
const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
require('dotenv').config();

const logFiles = new Map(); // Guardar logs detectados

// Pool de conexiones SFTP por detector
const connectionPool = new Map();

const DEFAULT_MAX_CONCURRENCY = parseInt(process.env.SFTP_MAX_CONCURRENCY) || 5;

// Conexión SSH con timeout
const connectSSH = () => {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const timeout = setTimeout(() => {
      try { conn.end(); } catch(e) {}
      reject(new Error('Timeout en conexión SSH'));
    }, 10000); // 10 segundos timeout

    conn.on('ready', () => {
      clearTimeout(timeout);
      console.log('✓ SSH conectado al detector');
      resolve(conn);
    });

    conn.on('error', (err) => {
      clearTimeout(timeout);
      try { conn.end(); } catch(e) {}
      console.error('✗ Error SSH:', err.message);
      reject(err);
    });

    conn.on('close', () => {
      clearTimeout(timeout);
    });

    conn.connect({
      host: process.env.SSH_HOST,
      port: parseInt(process.env.SSH_PORT) || 22,
      username: process.env.SSH_USER,
      password: process.env.SSH_PASSWORD,
      readyTimeout: 10000,
    });
  });
};

// Helper: esperar ms
const wait = (ms) => new Promise(r => setTimeout(r, ms));

// Conectar con reintentos exponenciales
const connectWithRetries = async (maxRetries = 3) => {
  let attempt = 0;
  let lastErr = null;
  while (attempt < maxRetries) {
    try {
      const conn = await connectSSH();
      return conn;
    } catch (err) {
      lastErr = err;
      attempt += 1;
      const backoff = 500 * Math.pow(2, attempt - 1);
      console.warn(`Intento SSH ${attempt}/${maxRetries} falló: ${err.message}. Reintentando en ${backoff}ms`);
      await wait(backoff);
    }
  }
  throw lastErr;
};

// Pool helpers
const poolKeyForConfig = (host, port, username) => `${host}:${port}:${username}`;

const createPersistentConnection = async (host, port, username, password) => {
  const key = poolKeyForConfig(host, port, username);
  if (connectionPool.has(key)) {
    const entry = connectionPool.get(key);
    if (entry.sftp) return entry; // already ready
  }

  const conn = await connectWithRetries(3);
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) {
        try { conn.end(); } catch(e) {}
        return reject(err);
      }

      const entry = {
        conn,
        sftp,
        busy: 0,
        queue: [],
        maxConcurrency: DEFAULT_MAX_CONCURRENCY,
        lastUsed: Date.now(),
      };

      // auto-clean on error
      conn.on('error', (e) => {
        console.warn('Pool connection error:', e.message);
        // mark closed
        if (connectionPool.has(key)) connectionPool.delete(key);
      });

      conn.on('close', () => {
        if (connectionPool.has(key)) connectionPool.delete(key);
      });

      connectionPool.set(key, entry);
      resolve(entry);
    });
  });
};

const acquireFromPool = async (host, port, username) => {
  const key = poolKeyForConfig(host, port, username);
  let entry = connectionPool.get(key);
  if (!entry) {
    entry = await createPersistentConnection(host, port, username, process.env.SSH_PASSWORD);
  }

  // wait if busy >= maxConcurrency
  if (entry.busy >= entry.maxConcurrency) {
    await new Promise((resolve) => entry.queue.push(resolve));
  }
  entry.busy += 1;
  entry.lastUsed = Date.now();
  return entry;
};

const releaseToPool = (entry) => {
  entry.busy = Math.max(0, entry.busy - 1);
  if (entry.queue.length > 0 && entry.busy < entry.maxConcurrency) {
    const next = entry.queue.shift();
    next();
  }
};

const closeAllPoolConnections = () => {
  for (const [k, entry] of connectionPool.entries()) {
    try { entry.conn.end(); } catch(e) {}
    connectionPool.delete(k);
  }
};

// Listar archivos .log en el servidor detector
const listDetectorLogs = async () => {
  const host = process.env.SSH_HOST;
  const port = parseInt(process.env.SSH_PORT) || 22;
  const user = process.env.SSH_USER;

  let entry = null;
  try {
    entry = await acquireFromPool(host, port, user);
    const sftp = entry.sftp;

    return await new Promise((resolve, reject) => {
      sftp.readdir(process.env.SSH_LOG_PATH, (err, list) => {
        if (err) {
          // on fatal SFTP error, close connection and retry once
          console.warn('SFTP readdir error:', err.message);
          try { entry.conn.end(); } catch(e) {}
          connectionPool.delete(poolKeyForConfig(host, port, user));
          releaseToPool(entry);
          return reject(err);
        }

        const files = list
          .filter(file => file.filename.endsWith('.log'))
          .sort((a, b) => new Date(b.attrs.mtime * 1000) - new Date(a.attrs.mtime * 1000))
          .map(file => ({
            nombre: file.filename,
            ruta: path.join(process.env.SSH_LOG_PATH, file.filename),
            tamaño: file.attrs.size,
            modificado: new Date(file.attrs.mtime * 1000),
            lineas: Math.floor(file.attrs.size / 50), // Estimado
          }));

        releaseToPool(entry);
        resolve(files);
      });
    });
  } catch (error) {
    if (entry) releaseToPool(entry);
    throw new Error(`Error listando logs: ${error.message}`);
  }
};

// Leer contenido de un archivo .log específico
const readDetectorLog = async (fileName) => {
  const host = process.env.SSH_HOST;
  const port = parseInt(process.env.SSH_PORT) || 22;
  const user = process.env.SSH_USER;

  let entry = null;
  try {
    entry = await acquireFromPool(host, port, user);
    const sftp = entry.sftp;

    return await new Promise((resolve, reject) => {
      const filePath = path.join(process.env.SSH_LOG_PATH, fileName);
      const stream = sftp.createReadStream(filePath);
      let content = '';
      let streamEnded = false;

      stream.on('data', (chunk) => {
        content += chunk.toString();
      });

      stream.on('end', () => {
        streamEnded = true;
        releaseToPool(entry);
        resolve(content);
      });

      stream.on('error', (err) => {
        streamEnded = true;
        try { entry.conn.end(); } catch(e) {}
        connectionPool.delete(poolKeyForConfig(host, port, user));
        releaseToPool(entry);
        reject(err);
      });

      // Prevenir memory leaks por stream no limpiado
      setTimeout(() => {
        if (!streamEnded) {
          try { stream.destroy(); } catch(e) {}
          try { entry.conn.end(); } catch(e) {}
          connectionPool.delete(poolKeyForConfig(host, port, user));
          releaseToPool(entry);
          reject(new Error('Timeout leyendo archivo'));
        }
      }, 30000); // 30 segundos timeout
    });
  } catch (error) {
    if (entry) releaseToPool(entry);
    throw new Error(`Error leyendo log: ${error.message}`);
  }
};

// Parsear línea del detector (7 valores numéricos + timestamp)
const parseDetectorLine = (line) => {
  const parts = line.trim().split(',').map(p => p.trim());
  
  if (parts.length < 8) return null;
  
  return {
    canal_1: parseInt(parts[0]),
    canal_2: parseInt(parts[1]),
    canal_3: parseInt(parts[2]),
    flag: parseInt(parts[3]),
    temp_ext: parseFloat(parts[4]),
    presion: parseFloat(parts[5]),
    humedad: parseFloat(parts[6]),
    timestamp: parts.slice(7).join(' '),
  };
};

module.exports = {
  listDetectorLogs,
  readDetectorLog,
  parseDetectorLine,
};

// Event emitter para notificar nuevos logs encontrados
const emitter = new EventEmitter();
let _polling = false;

// Inicia polling periódico para detectar nuevos archivos en el detector y emitir eventos
const startPollingForNewLogs = async (intervalMs = 8000) => {
  if (_polling) return;
  _polling = true;
  let known = new Set();
  try {
    const initial = await listDetectorLogs();
    initial.forEach(f => known.add(f.nombre));
  } catch (e) {
    // ignore initial error
  }

  setInterval(async () => {
    try {
      const files = await listDetectorLogs();
      for (const f of files) {
        if (!known.has(f.nombre)) {
          known.add(f.nombre);
          emitter.emit('newLog', f);
        }
      }
      // Prune known to prevent unbounded growth: keep most recent 500
      if (known.size > 500) {
        const keep = new Set(files.slice(0, 500).map(x => x.nombre));
        known = keep;
      }
    } catch (err) {
      console.warn('Polling logs error:', err.message);
    }
  }, intervalMs);
};

module.exports.emitter = emitter;
module.exports.startPollingForNewLogs = startPollingForNewLogs;

// Auto-start polling when service is required
startPollingForNewLogs();
