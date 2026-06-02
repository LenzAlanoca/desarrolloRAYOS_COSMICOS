# Backend - Rayos Cosmicos API

Backend desarrollado con Node.js y Express para el sistema web de Rayos Cosmicos.

## Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/      # Controladores de la lógica de negocio
│   ├── models/          # Modelos de datos
│   ├── routes/          # Rutas de la API
│   ├── middlewares/     # Middlewares personalizados
│   ├── config/          # Configuración de la aplicación
│   ├── utils/           # Utilidades y funciones auxiliares
│   └── server.js        # Archivo principal del servidor
├── .env                 # Variables de entorno
├── package.json         # Dependencias y scripts
└── README.md           # Este archivo
```

## Instalación

Las dependencias ya han sido instaladas. Para instalar nuevas dependencias:

```bash
npm install nombre-del-paquete
```

Para instalar dependencias de desarrollo:

```bash
npm install --save-dev nombre-del-paquete
```

## Dependencias Instaladas

- **express**: Framework web para Node.js
- **cors**: Middleware para manejo de CORS
- **dotenv**: Carga de variables de entorno
- **nodemon** (dev): Herramienta para reiniciar servidor automáticamente en desarrollo

## Scripts Disponibles

- `npm start` - Ejecutar servidor en modo producción
- `npm run dev` - Ejecutar servidor en modo desarrollo con nodemon

## Puerto

Por defecto, el servidor se ejecuta en el puerto **3000**. Puedes cambiar esto mediante la variable `PORT` en el archivo `.env`.

## Próximos Pasos

- [ ] Configurar base de datos
- [ ] Crear modelos de usuarios
- [ ] Crear modelos de datos (rayos cósmicos)
- [ ] Implementar rutas de API
- [ ] Agregar autenticación y autorización
- [ ] Agregar validación de datos
- [ ] Implementar manejo robusto de errores
