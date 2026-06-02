# Backend - Rayos Cosmicos API

## Estructura Actualizada

```
src/
├── config/
│   └── database.js           ← Conexión PostgreSQL
├── controllers/
│   └── logs.controller.js    ← Lógica de logs
├── services/
│   └── logs.service.js       ← Servicio SSH + parseo
├── routes/
│   └── logs.js               ← Rutas /api/logs
└── server.js                 ← Servidor Express
```

---

## Requisitos

1. **PostgreSQL** corriendo en localhost:5432
2. **Servidor SSH** en localhost (detector@localhost:detector123)
3. **Archivos .log** en `C:\DetectorMuon\logs\`

---

## Instalación

```bash
npm install
# Ya incluye: pg, ssh2, chokidar
```

---

## Configurar `.env`

```env
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=rayos_cosmicos

# SSH Detector
SSH_HOST=localhost
SSH_PORT=22
SSH_USER=detector
SSH_PASSWORD=detector123
SSH_LOG_PATH=C:\DetectorMuon\logs\
SSH_LOG_PATTERN=UMSA_EA_0x2F1_*.log
```

---

## Inicializar BDD

```bash
# Ejecutar en PostgreSQL (pgAdmin o psql):
psql -U postgres -d rayos_cosmicos -f SETUP_BDD.sql
```

---

## Ejecutar

```bash
npm run dev
# Servidor en http://localhost:3000
```

---

## Endpoints

### GET `/api/logs`
Ver todos los logs del detector + estado BDD

```bash
curl http://localhost:3000/api/logs
```

### GET `/api/logs/:fileName`
Ver contenido parseado de un archivo

```bash
curl http://localhost:3000/api/logs/UMSA_EA_0x2F1_2026-06-02_12-30-45.log
```

### POST `/api/logs/import/:fileName`
Importar log a BDD (preparado para futuro)

```bash
curl -X POST http://localhost:3000/api/logs/import/UMSA_EA_0x2F1_2026-06-02_12-30-45.log
```

---

## Características

✅ Conexión PostgreSQL configurada  
✅ Conexión SSH al detector lista  
✅ Listar archivos .log en tiempo real  
✅ Parsear formato CSV de muones  
✅ Endpoints preparados para importación  
✅ JSON con datos BDD + logs detectados  

---

## Documentación Detallada

Ver: `LOGS_API_DOCS.md`
