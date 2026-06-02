# API de Logs - Detector de Muones

## Endpoints

### 1. GET `/api/logs` 
**Ver todos los logs del detector + datos de la BDD**

Retorna JSON con:
- Información del dispositivo (código, nombre, estado)
- Variables que mide (canal_1, canal_2, etc.)
- Archivos .log importados en BDD
- Archivos .log detectados en servidor (en tiempo real)

**Ejemplo Respuesta:**
```json
{
  "device": {
    "id": 1,
    "codigo": "0x2F1",
    "nombre": "Detector Muones UMSA",
    "modelo": "EA",
    "estacion": "UMSA - Chacaltaya",
    "estado": "ACTIVO",
    "activo": true
  },
  "variables": [
    {
      "id": 1,
      "nombre": "Canal_1",
      "unidad": "conteos",
      "posicion": 0,
      "descripcion": "Canal 1 detector"
    }
  ],
  "archivosEnBDD": [
    {
      "id": 1,
      "nombre": "UMSA_EA_0x2F1_2026-06-01_18-10-00.log",
      "fecha_importacion": "2026-06-02T00:15:30.123Z",
      "ruta": "C:\\DetectorMuon\\logs\\..."
    }
  ],
  "archivosEnDetector": [
    {
      "nombre": "UMSA_EA_0x2F1_2026-06-02_12-30-45.log",
      "tamaño_bytes": 45230,
      "lineas_estimadas": 900,
      "modificado": "2026-06-02T12:30:45.000Z"
    }
  ],
  "total_archivos_detector": 5
}
```

---

### 2. GET `/api/logs/:fileName`
**Ver contenido parseado de un archivo específico**

Retorna primeros 50 eventos del log parseados.

**Ejemplo Respuesta:**
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
  ],
  "_nota": "Devuelve los primeros 50 eventos"
}
```

---

### 3. POST `/api/logs/import/:fileName`
**Preparado para futuro: Importar log a BDD**

Estado: Endpoint configurado, lógica en desarrollo

---

## Requisitos en `.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=rayos_cosmicos

SSH_HOST=localhost
SSH_PORT=22
SSH_USER=detector
SSH_PASSWORD=detector123
SSH_LOG_PATH=C:\DetectorMuon\logs\
SSH_LOG_PATTERN=UMSA_EA_0x2F1_*.log
```

---

## Configuración BDD

### Datos Mínimos Requeridos

**1. Tipo Dispositivo:**
```sql
INSERT INTO tipo_dispositivo(nombre, descripcion) 
VALUES ('Detector Muones', 'Detector de rayos cósmicos y muones');
```

**2. Estación:**
```sql
INSERT INTO estacion (nombre, ubicacion, latitud, longitud, altitud) 
VALUES ('UMSA - Chacaltaya', 'Laboratorio de Física Cósmica UMSA', -16.350000, -68.120000, 5200);
```

**3. Dispositivo:**
```sql
INSERT INTO dispositivo 
(id_estacion, id_tipo, codigo_hardware, nombre, modelo, extension_log, formato_log, estado_actual, activo)
VALUES
(1, 1, '0x2F1', 'Detector Muones UMSA', 'EA', 'log', 'CSV', 'ACTIVO', TRUE);
```

**4. Variables (7 por Detector Muones):**
```sql
INSERT INTO variable_medida (id_tipo, nombre, unidad, posicion_columna, descripcion) VALUES
(1, 'Canal_1', 'conteos', 0, 'Canal 1 detector'),
(1, 'Canal_2', 'conteos', 1, 'Canal 2 detector'),
(1, 'Canal_3', 'conteos', 2, 'Canal 3 detector'),
(1, 'Flag', 'binario', 3, 'Flag estado'),
(1, 'Temp_Ext', 'C', 4, 'Temperatura externa'),
(1, 'Presion', 'hPa', 5, 'Presión atmosférica'),
(1, 'Humedad', '%', 6, 'Humedad relativa');
```

---

## Flujo de Trabajo Actual

```
1. API conecta a PostgreSQL (BDD)
2. API se conecta vía SSH al detector
3. Lista archivos .log disponibles en C:\DetectorMuon\logs\
4. Devuelve en JSON:
   - Datos de BDD (dispositivos, variables)
   - Archivos ya importados
   - Archivos nuevos en servidor (tiempo real)
```

---

## Próxima Fase: Importar Logs a BDD

```
1. POST /api/logs/import/:fileName
2. Leer archivo del servidor SSH
3. Parsear cada línea
4. Crear registros en:
   - archivo_log (metadatos)
   - evento_cientifico (cada línea)
   - valor_medido (cada valor numérico)
```

---

## Estructura de Datos en Log

Formato CSV con 8 columnas:
```
CH1, CH2, CH3, FLAG, TEMP, PRESION, HUMEDAD, TIMESTAMP
794, 447, 752, 0,    6489, 8702,    7123,    Mon Jun 01 17:45:43 2026
```

| Pos | Variable | Tipo | Rango Típico |
|-----|----------|------|--------------|
| 0-2 | Canales | int | 0-65535 |
| 3 | Flag | binary | 0-1 |
| 4-6 | Env (Temp/Presión/Humedad) | float | Variable |
| 7 | Timestamp | string | Formato temporal |
