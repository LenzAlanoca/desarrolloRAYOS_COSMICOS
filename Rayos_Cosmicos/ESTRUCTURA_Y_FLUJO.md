# Estructura del Proyecto - Rayos Cosmicos

## 📁 Árbol de Carpetas

```
Rayos_Cosmicos/
├── frontend/                    ← Angular 17
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     ← Componentes UI
│   │   │   ├── pages/          ← Páginas (rutas)
│   │   │   ├── services/       ← Servicios HTTP
│   │   │   ├── models/         ← Interfaces TypeScript
│   │   │   └── guards/         ← Protecciones de rutas
│   │   ├── assets/
│   │   └── styles.css
│   ├── angular.json
│   └── package.json
│
└── backend/                     ← Express Node.js
    ├── src/
    │   ├── config/
    │   │   └── database.js      ← Pool PostgreSQL
    │   ├── controllers/
    │   │   └── logs.controller.js  ← Lógica de endpoints
    │   ├── services/
    │   │   └── logs.service.js    ← SSH + Parseo CSV
    │   ├── routes/
    │   │   └── logs.js            ← Rutas Express
    │   └── server.js            ← App principal
    ├── .env                     ← Variables de entorno
    ├── package.json
    └── package-lock.json
```

---

## 🔄 Flujo de Datos

```
DETECTOR (SSH)
    ↓ (Archivos .log en C:\DetectorMuon\logs\)
    ↓
BACKEND Express
    ├─ logs.service.js  → Conecta SSH, lee archivos, parsea CSV
    ├─ logs.controller.js → Consulta BDD + Detector
    └─ logs.js → Define rutas
    ↓
PostgreSQL (RayosCosmicos)
    ├── dispositivo (info detector)
    ├── variable_medida (7 variables)
    ├── archivo_log (archivos importados)
    └── evento_cientifico (datos parseados)
    ↓
FRONTEND (Angular)
    └─ Consume /api/logs
```

---

## 🚀 Endpoints Actuales

### GET `/api/logs`
**Archivo:** `src/controllers/logs.controller.js` → función `getAllLogs()`

**Retorna:**
- `device` → Datos del dispositivo (0x2F1)
- `variables` → Las 7 variables medidas
- `archivosEnBDD` → Logs ya importados en BD
- `archivosEnDetector` → Logs nuevos en servidor (tiempo real)

**Ejemplo curl:**
```bash
curl http://127.0.0.1:3000/api/logs
```

---

### GET `/api/logs/:fileName`
**Archivo:** `src/controllers/logs.controller.js` → función `getLogContent()`

**Retorna:**
- Primeros 50 eventos parseados del archivo
- Formato: `{canal_1, canal_2, canal_3, flag, temp_ext, presion, humedad, timestamp}`

**Ejemplo:**
```bash
curl http://127.0.0.1:3000/api/logs/UMSA_EA_0x2F1_2026-06-02_00-15-18.log
```

---

### POST `/api/logs/import/:fileName`
**Archivo:** `src/controllers/logs.controller.js` → función `importLogToDB()`

**Estado:** Endpoint preparado (placeholder)

**Próximo:** Implementar inserción en BD

---

## 🔧 Cómo Modificar

### 1. Agregar Nuevo Endpoint

**Paso 1:** Crear función en `src/controllers/logs.controller.js`
```javascript
const miNuevoEndpoint = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM mi_tabla');
    res.json({ data: resultado.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllLogs,
  getLogContent,
  importLogToDB,
  miNuevoEndpoint,  // ← AGREGAR AQUÍ
};
```

**Paso 2:** Agregar ruta en `src/routes/logs.js`
```javascript
router.get('/mi-endpoint', logsController.miNuevoEndpoint);
```

**Paso 3:** Hacer request
```bash
curl http://127.0.0.1:3000/api/logs/mi-endpoint
```

---

### 2. Consultar BDD desde Controller

```javascript
// Consulta simple
const result = await pool.query('SELECT * FROM dispositivo WHERE id_dispositivo = $1', [1]);

// Con múltiples parámetros
const result = await pool.query(
  'SELECT * FROM variable_medida WHERE id_tipo = $1 AND posicion_columna > $2',
  [tipoId, posicion]
);

// Usar resultado
const data = result.rows;  // Array de resultados
const row = result.rows[0]; // Primer resultado
```

---

### 3. Conectar SSH Detector desde Service

```javascript
// En logs.service.js
const logsService = require('../services/logs.service');

// Listar archivos
const logs = await logsService.listDetectorLogs();
// Retorna: [{nombre, tamaño, lineas, modificado}, ...]

// Leer contenido
const contenido = await logsService.readDetectorLog('archivo.log');

// Parsear línea
const evento = logsService.parseDetectorLine('794, 447, 752, 0, 6489, 8702, 7123, Mon Jun 01 17:45:43 2026');
// Retorna: {canal_1: 794, canal_2: 447, ..., timestamp: '...'}
```

---

## 📋 Variables de Entorno (`.env`)

```env
# Servidor
PORT=3000

# PostgreSQL
DB_HOST=127.0.0.1          # ← IMPORTANTE: usar 127.0.0.1 NO localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123456
DB_NAME=RayosCosmicos

# SSH Detector
SSH_HOST=localhost
SSH_PORT=22
SSH_USER=detector
SSH_PASSWORD=detector123
SSH_LOG_PATH=C:\DetectorMuon\logs\
SSH_LOG_PATTERN=UMSA_EA_0x2F1_*.log
```

---

## 🗄️ Tablas de BDD Importantes

| Tabla | Propósito | Clave |
|-------|-----------|-------|
| `dispositivo` | Info del detector (0x2F1) | `id_dispositivo` |
| `variable_medida` | Las 7 variables medidas | `id_variable` |
| `archivo_log` | Logs importados en BD | `id_archivo` |
| `evento_cientifico` | Cada línea del log = 1 evento | `id_evento` |
| `valor_medido` | Valor de cada variable en evento | `id_valor` |

---

## 🔌 Pool de Conexión PostgreSQL

**Archivo:** `src/config/database.js`

```javascript
const pool = require('../config/database');

// Consultar
const result = await pool.query(sql, params);

// result.rows   → Array de registros
// result.rowCount → Número de filas afectadas
```

**Importante:** Pool maneja automáticamente reconexiones y errores.

---

## 📤 Respuestas de Error

Si hay error en endpoint, retorna automáticamente:
```json
{
  "error": "Descripción del error"
}
```

Revisar en `src/server.js` middleware de errores.

---

## 🚀 Iniciar Proyecto

```bash
# Terminal 1: Backend
cd backend
node src/server.js
# Servidor en http://127.0.0.1:3000

# Terminal 2: Frontend
cd frontend
ng serve
# Servidor en http://localhost:4200
```

---

## 📝 Para Implementar en Futuro

### 1. Importar Logs a BDD
**Archivo:** `src/controllers/logs.controller.js` → `importLogToDB()`

Necesita:
- Leer archivo con `logsService.readDetectorLog()`
- Parsear cada línea con `logsService.parseDetectorLine()`
- Insertar en `archivo_log` y `evento_cientifico`
- Crear registros en `valor_medido` para cada variable

### 2. Frontend - Mostrar Logs
**Archivo:** `frontend/src/app/services/`

Crear servicio HTTP que llame a `/api/logs`

### 3. Monitoreo en Tiempo Real
**Archivo:** `src/services/logs.service.js`

Ya tiene `chokidar` instalado. Agregar watcher para detectar nuevos .log automáticamente.

---

## 🔑 Resumen: Dónde Modificar Qué

| Necesito cambiar... | Archivo | Función |
|---------------------|---------|---------|
| Endpoint HTTP | `src/controllers/logs.controller.js` | Crear función |
|  | `src/routes/logs.js` | Agregar ruta |
| Consulta a BD | `src/controllers/logs.controller.js` | Usar `pool.query()` |
| Conectar SSH | `src/services/logs.service.js` | Usar funciones existentes |
| Variables .env | `.env` | Editar valores |
| Frontend | `frontend/src/app/` | Crear componentes |
| UI principal | `frontend/src/app/app.component.ts` | Editar template |

---

## 💡 Tips

- Logs del servidor: Ver en terminal donde corre `node src/server.js`
- Errores SQL: Copiar query y probar en pgAdmin
- Contraseña PostgreSQL: `123456`
- Usuario PostgreSQL: `postgres`
- Puerto PostgreSQL: `5432`
- Usar `127.0.0.1` en lugar de `localhost` para conectar a BD

