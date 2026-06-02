const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    if (!correo || !contrasena) return res.status(400).json({ error: 'correo y contrasena requeridos' });

    const result = await pool.query('SELECT * FROM usuario WHERE correo = $1 LIMIT 1', [correo]);
    if (result.rowCount === 0) return res.status(401).json({ error: 'usuario no encontrado' });

    const usuario = result.rows[0];
    // comparar contraseña usando bcrypt
    const stored = usuario.contrasena || '';
    // comparar contraseña usando bcrypt; no se acepta comparación en texto plano
    let match = false;
    try {
      match = await bcrypt.compare(contrasena, stored);
    } catch (e) {
      console.error('Error al comparar hash de contraseña:', e);
      return res.status(500).json({ error: 'error interno de autenticación' });
    }

    if (!match) return res.status(401).json({ error: 'credenciales inválidas' });

    const payload = {
      id_usuario: usuario.id_usuario || usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol || usuario.role || 'user'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
    res.json({ token });
  } catch (error) {
    console.error('Error en login:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { login };
