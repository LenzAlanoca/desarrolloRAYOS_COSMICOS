const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs.controller');

// GET /api/logs - Ver todos los logs del detector + datos BDD
router.get('/', logsController.getAllLogs);

// GET /api/logs/:fileName - Ver contenido de un archivo específico
// GET /api/logs/aggregate/:fileName - Obtener agregados e interpretación acumulada
router.get('/aggregate/:fileName', logsController.getLogAggregates);
// GET /api/logs/pivot/:fileName - Medidas pivotadas como arreglo
router.get('/pivot/:fileName', logsController.getLogPivot);
// SSE stream para nuevos logs
router.get('/stream', logsController.streamLogs);

// SSE stream para contenido en tiempo real de un archivo específico
// SSE stream que agrega líneas de todos los archivos (acumulado)
router.get('/stream/all', logsController.streamAllFiles);
router.get('/stream/:fileName', logsController.streamLogFile);

// Dev trigger: POST /api/logs/trigger
router.post('/trigger', express.json(), logsController.triggerNewLog);

// POST /api/logs/import/:fileName - Importar log a BDD (preparado para futuro)
router.post('/import/:fileName', logsController.importLogToDB);

// GET /api/logs/:fileName - Ver contenido de un archivo específico (debe ir después de rutas específicas)
router.get('/:fileName', logsController.getLogContent);

module.exports = router;
