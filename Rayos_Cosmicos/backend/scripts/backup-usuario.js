#!/usr/bin/env node
// Exporta la tabla `usuario` a un JSON en scripts/usuario-backup-<ts>.json
const pool = require('../src/config/database');
const fs = require('fs');

async function backup() {
  try {
    const res = await pool.query('SELECT * FROM usuario');
    const ts = new Date().toISOString().replace(/[:.]/g,'-');
    const path = `./scripts/usuario-backup-${ts}.json`;
    fs.writeFileSync(path, JSON.stringify(res.rows, null, 2), 'utf8');
    console.log('Backup guardado en', path);
    process.exit(0);
  } catch (err) {
    console.error('Error creando backup:', err);
    process.exit(1);
  }
}

backup();
