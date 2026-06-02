const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
require('dotenv').config();

const logFiles = new Map(); // Guardar logs detectados

// Conexión SSH
const connectSSH = () => {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    
    conn.on('ready', () => {
      console.log('✓ SSH conectado al detector');
      resolve(conn);
    });
    
    conn.on('error', (err) => {
      console.error('✗ Error SSH:', err.message);
      reject(err);
    });
    
    conn.connect({
      host: process.env.SSH_HOST,
      port: parseInt(process.env.SSH_PORT) || 22,
      username: process.env.SSH_USER,
      password: process.env.SSH_PASSWORD,
    });
  });
};

// Listar archivos .log en el servidor detector
const listDetectorLogs = async () => {
  try {
    const conn = await connectSSH();
    
    return new Promise((resolve, reject) => {
      conn.sftp((err, sftp) => {
        if (err) {
          conn.end();
          reject(err);
          return;
        }
        
        sftp.readdir(process.env.SSH_LOG_PATH, (err, list) => {
          conn.end();
          
          if (err) {
            reject(err);
            return;
          }
          
          const logFiles = list
            .filter(file => file.filename.endsWith('.log'))
            .sort((a, b) => new Date(b.attrs.mtime * 1000) - new Date(a.attrs.mtime * 1000))
            .map(file => ({
              nombre: file.filename,
              ruta: path.join(process.env.SSH_LOG_PATH, file.filename),
              tamaño: file.attrs.size,
              modificado: new Date(file.attrs.mtime * 1000),
              lineas: Math.floor(file.attrs.size / 50), // Estimado
            }));
          
          resolve(logFiles);
        });
      });
    });
  } catch (error) {
    throw new Error(`Error listando logs: ${error.message}`);
  }
};

// Leer contenido de un archivo .log específico
const readDetectorLog = async (fileName) => {
  try {
    const conn = await connectSSH();
    
    return new Promise((resolve, reject) => {
      conn.sftp((err, sftp) => {
        if (err) {
          conn.end();
          reject(err);
          return;
        }
        
        const filePath = path.join(process.env.SSH_LOG_PATH, fileName);
        const stream = sftp.createReadStream(filePath);
        let content = '';
        
        stream.on('data', (chunk) => {
          content += chunk.toString();
        });
        
        stream.on('end', () => {
          conn.end();
          resolve(content);
        });
        
        stream.on('error', (err) => {
          conn.end();
          reject(err);
        });
      });
    });
  } catch (error) {
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
