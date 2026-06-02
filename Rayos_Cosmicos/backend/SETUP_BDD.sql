-- ================================================
-- SCRIPT: Inicializar BDD Rayos Cosmicos
-- Instrucciones rápidas para Detector Muones
-- ================================================

-- PASO 1: Tipo de Dispositivo
INSERT INTO tipo_dispositivo(nombre, descripcion) 
VALUES ('Detector Muones', 'Detector de rayos cósmicos UMSA');

-- PASO 2: Estación
INSERT INTO estacion (nombre, ubicacion, latitud, longitud, altitud) 
VALUES ('UMSA - Chacaltaya', 'Laboratorio de Física Cósmica UMSA', -16.350000, -68.120000, 5200);

-- PASO 3: Dispositivo
INSERT INTO dispositivo 
(id_estacion, id_tipo, codigo_hardware, nombre, modelo, extension_log, formato_log, estado_actual, activo)
VALUES
(1, 1, '0x2F1', 'Detector Muones UMSA', 'EA', 'log', 'CSV', 'ACTIVO', TRUE);

-- PASO 4: Variables de Medida (7 variables)
INSERT INTO variable_medida (id_tipo, nombre, unidad, posicion_columna, descripcion) VALUES
(1, 'Canal_1', 'conteos', 0, 'Detector canal 1'),
(1, 'Canal_2', 'conteos', 1, 'Detector canal 2'),
(1, 'Canal_3', 'conteos', 2, 'Detector canal 3'),
(1, 'Flag', 'binario', 3, 'Flag estado'),
(1, 'Temp_Ext', 'C', 4, 'Temperatura externa'),
(1, 'Presion', 'hPa', 5, 'Presión atmosférica'),
(1, 'Humedad', '%', 6, 'Humedad relativa');

-- PASO 5: Usuario (opcional, para logs)
INSERT INTO usuario (nombre, correo, contrasena, rol) 
VALUES ('Admin', 'admin@umsa.bo', 'admin123', 'ADMIN');

-- ================================================
-- Verificar datos insertados
-- ================================================

SELECT 'Tipo de Dispositivo:' as info;
SELECT * FROM tipo_dispositivo;

SELECT 'Estación:' as info;
SELECT * FROM estacion;

SELECT 'Dispositivo:' as info;
SELECT * FROM dispositivo;

SELECT 'Variables Medida:' as info;
SELECT * FROM variable_medida ORDER BY posicion_columna;
