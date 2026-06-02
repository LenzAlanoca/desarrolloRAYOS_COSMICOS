#!/usr/bin/env node
/*
  Script de migración para hashear contraseñas existentes en la tabla `usuario`.
  - Hacer backup antes de ejecutar.
  - Ejecutar: node scripts/hash-passwords.js
*/

const pool = require('../src/config/database');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function backupAndHash() {
  try {
    console.log('Comenzando migración: leer usuarios...');
    const res = await pool.query('SELECT id_usuario, correo, contrasena FROM usuario');
    console.log(`Usuarios encontrados: ${res.rowCount}`);

    for (const row of res.rows) {
      const id = row.id_usuario || row.id;
      const plain = row.contrasena || '';
      if (!plain) {
        console.log(`- Usuario ${id} sin contraseña, saltando`);
        continue;
      }

      // Si ya parece un hash bcrypt (comienza con $2b$ o $2a$) lo saltamos
      if (typeof plain === 'string' && (plain.startsWith('$2b$') || plain.startsWith('$2a$') || plain.startsWith('$2y$'))) {
        console.log(`- Usuario ${id} ya tiene hash, saltando`);
        continue;
      }

      const hash = await bcrypt.hash(plain, SALT_ROUNDS);
      // actualizar en la base de datos
      await pool.query('UPDATE usuario SET contrasena = $1 WHERE id_usuario = $2', [hash, id]);
      console.log(`- Usuario ${id} hasheado`);
    }

    console.log('Migración completada. Asegúrate de revisar la tabla `usuario`.');
    process.exit(0);
  } catch (err) {
    console.error('Error en migración:', err);
    process.exit(1);
  }
}

backupAndHash();
