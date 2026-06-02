const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs.controller');

// GET /api/logs - Ver todos los logs del detector + datos BDD
router.get('/', logsController.getAllLogs);

// GET /api/logs/:fileName - Ver contenido de un archivo específico
router.get('/:fileName', logsController.getLogContent);

// POST /api/logs/import/:fileName - Importar log a BDD (preparado para futuro)
router.post('/import/:fileName', logsController.importLogToDB);

module.exports = router;
