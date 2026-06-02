# Estructura de Base de Datos - Rayos Cósmicos

## Conexión
- **Host:** localhost
- **Usuario:** (configurable en .env)
- **Password:** (configurable en .env)
- **Base de datos:** (configurable en .env)

---

## Tablas Principales

### 1. `tipo_dispositivo`
Define tipos de sensores/detectores.
```sql
CREATE TABLE tipo_dispositivo (
   id_tipo SERIAL PRIMARY KEY,
   nombre VARCHAR(100) NOT NULL,
   descripcion TEXT
);
```
**Ejemplo:** Detector de Muones, Sensor de Radiación, etc.

---

### 2. `estacion`
Ubicaciones/estaciones donde se instalan dispositivos.
```sql
CREATE TABLE estacion (
   id_estacion SERIAL PRIMARY KEY,
   nombre VARCHAR(100) NOT NULL,
   ubicacion TEXT,
   latitud NUMERIC(9,6),
   longitud NUMERIC(9,6),
   altitud NUMERIC(8,2)
);
```
**Ejemplo:** UMSA (Universidad Mayor de San Andrés), Estación 1, etc.

---

### 3. `dispositivo`
Dispositivos físicos instalados en estaciones.
```sql
CREATE TABLE dispositivo (
   id_dispositivo SERIAL PRIMARY KEY,
   id_estacion INTEGER REFERENCES estacion(id_estacion),
   id_tipo INTEGER REFERENCES tipo_dispositivo(id_tipo),
   codigo_hardware VARCHAR(100),
   nombre VARCHAR(100),
   modelo VARCHAR(100),
   extension_log VARCHAR(20),
   formato_log VARCHAR(50),
   estado_actual VARCHAR(50),
   activo BOOLEAN DEFAULT TRUE
);
```
**Ejemplo:** Detector Muones UMSA (0x2F1) con logs .log en formato CSV

---

### 4. `archivo_log`
Archivos de logs generados por dispositivos en tiempo real.
```sql
CREATE TABLE archivo_log (
   id_archivo BIGSERIAL PRIMARY KEY,
   id_dispositivo INTEGER REFERENCES dispositivo(id_dispositivo),
   nombre_archivo TEXT,
   ruta_archivo TEXT,
   fecha_inicio TIMESTAMP,
   fecha_importacion TIMESTAMP DEFAULT NOW(),
   hash_archivo TEXT
);
```
**Ejemplo:** UMSA_EA_0x2F1_2026-06-01_18-10-00.log

---

### 5. `evento_cientifico`
Eventos/mediciones individuales dentro de archivos logs.
```sql
CREATE TABLE evento_cientifico (
   id_evento BIGSERIAL PRIMARY KEY,
   id_archivo BIGINT REFERENCES archivo_log(id_archivo),
   numero_linea INTEGER,
   fecha_hora TIMESTAMP
);
```

---

### 6. `variable_medida`
Variables que cada tipo de dispositivo mide.
```sql
CREATE TABLE variable_medida (
   id_variable SERIAL PRIMARY KEY,
   id_tipo INTEGER REFERENCES tipo_dispositivo(id_tipo),
   nombre VARCHAR(100),
   unidad VARCHAR(20),
   posicion_columna INTEGER,
   descripcion TEXT
);
```

---

### 7. `valor_medido`
Valores medidos de cada variable en cada evento.
```sql
CREATE TABLE valor_medido (
   id_valor BIGSERIAL PRIMARY KEY,
   id_evento BIGINT REFERENCES evento_cientifico(id_evento),
   id_variable INTEGER REFERENCES variable_medida(id_variable),
   valor NUMERIC(20,6)
);
```

---

### 8. `usuario`
Usuarios del sistema.
```sql
CREATE TABLE usuario (
   id_usuario SERIAL PRIMARY KEY,
   nombre VARCHAR(100),
   correo VARCHAR(150) UNIQUE,
   contrasena TEXT,
   rol VARCHAR(50)
);
```

---

### 9. `log_sesion`
Registro de sesiones de usuario.
```sql
CREATE TABLE log_sesion (
   id_log BIGSERIAL PRIMARY KEY,
   id_usuario INTEGER REFERENCES usuario(id_usuario),
   fecha_hora TIMESTAMP DEFAULT NOW(),
   ip_origen VARCHAR(100)
);
```

---

### 10. `log_estado_maquina`
Cambios de estado de dispositivos.
```sql
CREATE TABLE log_estado_maquina (
   id_log_maquina BIGSERIAL PRIMARY KEY,
   id_dispositivo INTEGER REFERENCES dispositivo(id_dispositivo),
   id_usuario INTEGER REFERENCES usuario(id_usuario),
   estado_anterior VARCHAR(50),
   estado_nuevo VARCHAR(50),
   comentario TEXT,
   fecha_hora TIMESTAMP DEFAULT NOW()
);
```

---

## Secuencia de Inicialización

### PASO 1: Insertar Roles
```sql
INSERT INTO usuario (nombre, correo, contrasena, rol) VALUES
('Administrador', 'admin@umsa.bo', 'admin123', 'ADMIN'),
('Investigador', 'investigador@umsa.bo', 'invest123', 'INVESTIGADOR');
```

### PASO 2: Insertar Tipo de Dispositivo
```sql
INSERT INTO tipo_dispositivo(nombre, descripcion) VALUES
('Detector Muones', 'Detector de rayos cósmicos y muones');
```

### PASO 3: Insertar Estación
```sql
INSERT INTO estacion (nombre, ubicacion, latitud, longitud, altitud) VALUES
('UMSA - Chacaltaya', 'Laboratorio de Física Cósmica UMSA', -16.350000, -68.120000, 5200);
```

### PASO 4: Insertar Dispositivo
```sql
INSERT INTO dispositivo 
(id_estacion, id_tipo, codigo_hardware, nombre, modelo, extension_log, formato_log, estado_actual, activo)
VALUES
(1, 1, '0x2F1', 'Detector Muones UMSA', 'EA', 'log', 'CSV', 'ACTIVO', TRUE);
```

### PASO 5: Definir Variables de Medida (Detector Muones)
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

## Agregar Nuevo Dispositivo (Genérico)

1. **Crear Tipo** (si no existe):
   ```sql
   INSERT INTO tipo_dispositivo(nombre, descripcion) VALUES ('Nuevo Sensor', 'Descripción');
   ```

2. **Agregar Dispositivo**:
   ```sql
   INSERT INTO dispositivo 
   (id_estacion, id_tipo, codigo_hardware, nombre, modelo, extension_log, formato_log, estado_actual, activo)
   VALUES (estacion_id, tipo_id, 'codigo', 'nombre', 'modelo', 'ext', 'formato', 'ACTIVO', TRUE);
   ```

3. **Definir Variables** (por cada variable que mida):
   ```sql
   INSERT INTO variable_medida (id_tipo, nombre, unidad, posicion_columna, descripcion)
   VALUES (tipo_id, 'var_nombre', 'unidad', posicion, 'descripción');
   ```

---

## Detector Muones UMSA (0x2F1)

### Formato de Datos en Log
```
794, 447, 752, 0, 6489, 8702, 7123, Mon Jun 01 17:45:43 2026
816, 435, 827, 0, 6392, 8894, 6766, Mon Jun 01 17:45:53 2026
```

### Mapeo de Columnas
| Pos | Variable | Unidad | Descripción |
|-----|----------|--------|-------------|
| 0 | Canal_1 | conteos | Detector canal 1 |
| 1 | Canal_2 | conteos | Detector canal 2 |
| 2 | Canal_3 | conteos | Detector canal 3 |
| 3 | Flag | binario | Estado operativo |
| 4 | Temp_Ext | °C | Temperatura externa |
| 5 | Presion | hPa | Presión atmosférica |
| 6 | Humedad | % | Humedad relativa |
| 7 | Timestamp | - | Fecha/hora del evento |

### Flujo de Ingesta de Logs
```
1. SSH: ssh detector@localhost (pass: detector123)
2. Dir: C:\DetectorMuon\logs\
3. Archivos: UMSA_EA_0x2F1_YYYY-MM-DD_HH-MM-SS.log (nuevo cada tiempo)
4. Leer línea → Crear evento_cientifico
5. Parsear valores → Crear valor_medido para cada variable
6. Almacenar en BDD
```

### Parámetros en .env (Backend)
```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=rayos_cosmicos
DB_PORT=5432

SSH_HOST=localhost
SSH_USER=detector
SSH_PASS=detector123
SSH_LOG_PATH=C:\DetectorMuon\logs\
SSH_LOG_PATTERN=UMSA_EA_0x2F1_*.log
```

---

## Relaciones Clave
```
tipo_dispositivo → dispositivo → estacion
              ↓
        variable_medida
              ↓
        archivo_log → evento_cientifico → valor_medido
```

**Flujo:** Tipo define qué variables se miden → Dispositivo instancia ese tipo → Logs contienen eventos → Eventos contienen valores de esas variables
