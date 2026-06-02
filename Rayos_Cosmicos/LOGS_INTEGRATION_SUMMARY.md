# ✅ Integración BDD + Detector de Muones - COMPLETADA

## Resumen de lo Realizado

### 1. Documentación de BDD Mejorada ✅
- Archivo: `inicializacionBDD.md` (actualizado con formato)
- Incluye: Estructura completa de 10 tablas
- Sección: "Cómo agregar nuevos dispositivos" (genérico)
- Sección: "Detector Muones UMSA (0x2F1)" con mapeo de datos
- Tabla: Relaciones y flujo de ingesta de logs

### 2. Backend Integrado con PostgreSQL ✅

**Archivos Creados:**
```
backend/
├── .env                          ← Config BD + SSH
├── src/
│   ├── config/database.js        ← Pool PostgreSQL
│   ├── services/logs.service.js  ← SSH + parseo CSV
│   ├── controllers/logs.controller.js
│   ├── routes/logs.js
│   └── server.js                 ← Actualizado
├── SETUP_BDD.sql                 ← Script SQL rápido
├── LOGS_API_DOCS.md              ← Documentación endpoints
└── README_ACTUALIZADO.md
```

**Dependencias Instaladas:**
- pg (PostgreSQL)
- ssh2 (conexión SSH)
- chokidar (monitoreo archivos)

---

## Endpoints Implementados

### 1. GET `/api/logs`
**Retorna JSON con:**
- Información del dispositivo (código 0x2F1, nombre, estado)
- Variables medidas (Canal_1, Canal_2, Canal_3, Flag, Temp, Presión, Humedad)
- Archivos .log importados en BDD
- **Archivos .log detectados en tiempo real** en servidor

```json
{
  "device": {...},
  "variables": [...],
  "archivosEnBDD": [...],
  "archivosEnDetector": [
    {
      "nombre": "UMSA_EA_0x2F1_2026-06-02_12-30-45.log",
      "tamaño_bytes": 45230,
      "lineas_estimadas": 900,
      "modificado": "2026-06-02T12:30:45Z"
    }
  ],
  "total_archivos_detector": 5
}
```

### 2. GET `/api/logs/:fileName`
**Retorna primeros 50 eventos parseados:**
```json
{
  "archivo": "UMSA_EA_0x2F1_2026-06-02_12-30-45.log",
  "total_eventos": 1250,
  "eventos": [
    {
      "linea": 1,
      "canal_1": 794,
      "canal_2": 447,
      "canal_3": 752,
      "flag": 0,
      "temp_ext": 6489,
      "presion": 8702,
      "humedad": 7123,
      "timestamp": "Mon Jun 01 17:45:43 2026"
    }
  ]
}
```

### 3. POST `/api/logs/import/:fileName`
**Endpoint preparado para futuro:**
- Lógica lista para implementar importación a BDD
- Parseará eventos
- Creará registros en: archivo_log, evento_cientifico, valor_medido

---

## Flujo de Datos

```
┌─────────────────────────────────────────────────────┐
│  SERVIDOR DETECTOR (SSH)                            │
│  C:\DetectorMuon\logs\                              │
│  UMSA_EA_0x2F1_YYYY-MM-DD_HH-MM-SS.log             │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓ (SSH Connection)
┌─────────────────────────────────────────────────────┐
│  BACKEND EXPRESS (Node.js)                          │
│  - Conecta vía SSH a detector                       │
│  - Lee archivos .log en tiempo real                 │
│  - Parsea formato CSV                              │
│  - Retorna JSON con datos BDD + logs nuevos        │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓ (HTTP JSON)
┌─────────────────────────────────────────────────────┐
│  FRONTEND / CLIENTE                                 │
│  GET /api/logs → Ve logs disponibles                │
│  GET /api/logs/:fileName → Ve contenido parseado   │
│  POST /api/logs/import/:fileName → Importar (futuro)
└─────────────────────────────────────────────────────┘
                 │
                 ↓ (Futuro)
┌─────────────────────────────────────────────────────┐
│  POSTGRESQL (Rayos Cosmicos DB)                     │
│  - archivo_log (metadatos del .log)                │
│  - evento_cientifico (cada línea = 1 evento)       │
│  - valor_medido (valores de cada variable)         │
└─────────────────────────────────────────────────────┘
```

---

## Configuración Requerida

### 1. `.env` Backend
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=rayos_cosmicos
SSH_HOST=localhost
SSH_USER=detector
SSH_PASSWORD=detector123
SSH_LOG_PATH=C:\DetectorMuon\logs\
```

### 2. Datos Iniciales en BDD
Ejecutar: `backend/SETUP_BDD.sql`

Crea automáticamente:
- 1 Tipo de Dispositivo (Detector Muones)
- 1 Estación (UMSA - Chacaltaya)
- 1 Dispositivo (código 0x2F1)
- 7 Variables de Medida

### 3. Servidor SSH Accesible
- Host: localhost
- User: detector
- Pass: detector123
- Path: C:\DetectorMuon\logs\

---

## Testing de Endpoints

```bash
# Ver todos los logs del detector
curl http://localhost:3000/api/logs

# Ver contenido de archivo específico
curl http://localhost:3000/api/logs/UMSA_EA_0x2F1_2026-06-02_12-30-45.log

# Preparado para importación (futuro)
curl -X POST http://localhost:3000/api/logs/import/UMSA_EA_0x2F1_2026-06-02_12-30-45.log
```

---

## Lógica de Formato de Datos

### Log del Detector
```
794, 447, 752, 0, 6489, 8702, 7123, Mon Jun 01 17:45:43 2026
```

### Mapeo a Variables
| CSV Pos | Nombre | Unidad | Tabla variable_medida |
|---------|--------|--------|----------------------|
| 0 | Canal_1 | conteos | posicion_columna = 0 |
| 1 | Canal_2 | conteos | posicion_columna = 1 |
| 2 | Canal_3 | conteos | posicion_columna = 2 |
| 3 | Flag | binario | posicion_columna = 3 |
| 4 | Temp_Ext | C | posicion_columna = 4 |
| 5 | Presion | hPa | posicion_columna = 5 |
| 6 | Humedad | % | posicion_columna = 6 |
| 7 | Timestamp | - | timestamp de evento |

### Cuando Importes Logs (Futuro)
```sql
-- Crear evento (1 línea = 1 evento)
INSERT INTO evento_cientifico 
(id_archivo, numero_linea, fecha_hora)
VALUES (1, 1, '2026-06-01 17:45:43');

-- Crear valores (7 valores por evento)
INSERT INTO valor_medido 
(id_evento, id_variable, valor)
VALUES 
(1, 1, 794),      -- Canal_1
(1, 2, 447),      -- Canal_2
(1, 3, 752),      -- Canal_3
(1, 4, 0),        -- Flag
(1, 5, 6489),     -- Temp_Ext
(1, 6, 8702),     -- Presion
(1, 7, 7123);     -- Humedad
```

---

## ✨ Características Implementadas

✅ Conexión PostgreSQL en backend  
✅ Conexión SSH a servidor detector  
✅ Listar archivos .log en tiempo real  
✅ Parsear formato CSV del detector  
✅ Endpoint JSON con datos BDD + logs nuevos  
✅ Documentación de mapeo de variables  
✅ Script SQL para setup rápido  
✅ Endpoints preparados para importación futura  
✅ Arquitectura escalable para nuevos dispositivos  

---

## 📝 Documentación Disponible

- `inicializacionBDD.md` - Estructura BDD completa (ACTUALIZADO)
- `backend/LOGS_API_DOCS.md` - Endpoints detallados
- `backend/SETUP_BDD.sql` - Script de inicialización
- `backend/README_ACTUALIZADO.md` - Setup del backend

---

## Próximos Pasos

1. **Configurar PostgreSQL** en tu máquina
2. **Actualizar .env** con credenciales reales
3. **Ejecutar SETUP_BDD.sql** en PostgreSQL
4. **Ejecutar backend:** `npm run dev`
5. **Probar endpoint:** `curl http://localhost:3000/api/logs`

Una vez que veas los archivos .log en JSON:
6. Implementar lógica de importación en POST `/api/logs/import/:fileName`
7. Parsear eventos
8. Almacenar en BDD automáticamente

---

**Sistema preparado para ingestar logs en tiempo real.** 🚀
