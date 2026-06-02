const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/', (req, res) => {
  res.json({ message: 'API de Rayos Cosmicos - Sistema Web' });
});

// Cargar rutas de logs
try {
  const logsRoutes = require('./routes/logs');
  app.use('/api/logs', logsRoutes);
  console.log('Rutas de logs cargadas correctamente');
} catch (error) {
  console.error('Error al cargar rutas de logs:', error.message);
}

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en middleware:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor', message: err.message });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Excepción no capturada:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});
