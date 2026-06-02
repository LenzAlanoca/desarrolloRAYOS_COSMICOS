# Rayos Cosmicos - Sistema Web

## Información del Proyecto

Este es un sistema web modularizado para el análisis de Rayos Cosmicos, desarrollado con tecnologías modernas:

- **Frontend**: Angular 17 (TypeScript, componentes reutilizables)
- **Backend**: Node.js + Express (API REST modularizada)

---

## Estructura del Proyecto Completa

```
Rayos_Cosmicos/
├── frontend/                    # Aplicación Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # Componentes reutilizables
│   │   │   ├── pages/          # Páginas principales
│   │   │   ├── services/       # Servicios (HTTP, lógica compartida)
│   │   │   ├── models/         # Interfaces de datos
│   │   │   ├── guards/         # Guards de autenticación/autorización
│   │   │   ├── app.routes.ts   # Rutas de la aplicación
│   │   │   ├── app.config.ts   # Configuración
│   │   │   └── app.component.* # Componente raíz
│   │   ├── assets/
│   │   ├── styles.css
│   │   └── index.html
│   ├── angular.json
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
└── backend/                     # API Express
    ├── src/
    │   ├── controllers/         # Controladores de lógica
    │   ├── models/             # Modelos de datos
    │   ├── routes/             # Definición de rutas
    │   ├── middlewares/        # Middlewares personalizados
    │   ├── config/             # Configuración (BD, etc.)
    │   ├── utils/              # Funciones auxiliares
    │   └── server.js           # Punto de entrada
    ├── .env                    # Variables de entorno
    ├── package.json
    └── README.md
```

---

## Estado de la Instalación

### ✅ Frontend (Angular)
- **Estado**: Instalado y configurado
- **Versión**: Angular 17.3.17
- **Dependencias**: 883 paquetes instalados
- **Características**:
  - Enrutamiento habilitado
  - Estructura modular con carpetas para componentes, servicios, modelos y guards
  - TypeScript configurado
  - Build tools y testing framework incluidos

### ✅ Backend (Node.js + Express)
- **Estado**: Inicializado y configurado
- **Versión**: Node.js v20.14.0, Express 5.2.1
- **Dependencias instaladas**:
  - express (5.2.1)
  - cors (2.8.6)
  - dotenv (17.4.2)
  - nodemon (3.1.14) - para desarrollo

---

## Cómo Ejecutar el Proyecto

### Ejecutar Frontend
```bash
cd frontend
npm start
# Accede a http://localhost:4200/
```

### Ejecutar Backend
```bash
cd backend
npm run dev
# El servidor se ejecutará en http://localhost:3000/
```

### Compilar Frontend para Producción
```bash
cd frontend
npm run build
# Los archivos compilados estarán en dist/
```

---

## Próximos Pasos Recomendados

### Backend
1. [ ] Configurar conexión a base de datos (MongoDB, PostgreSQL, etc.)
2. [ ] Crear modelos de datos (Usuario, DatosRayos, etc.)
3. [ ] Implementar controladores para CRUD operations
4. [ ] Crear rutas de API organizadas
5. [ ] Implementar autenticación (JWT)
6. [ ] Agregar validación de datos
7. [ ] Configurar manejo de errores robusto

### Frontend
1. [ ] Crear componentes principales (Header, Sidebar, etc.)
2. [ ] Crear páginas (Home, Dashboard, Login, etc.)
3. [ ] Crear servicios para comunicación con API
4. [ ] Implementar autenticación y guards de rutas
5. [ ] Agregar formularios con validación
6. [ ] Implementar diseño responsive (Bootstrap, Tailwind, etc.)
7. [ ] Agregar manejo de estado si es necesario

### General
1. [ ] Documentar API REST
2. [ ] Crear scripts de deployment
3. [ ] Configurar variables de entorno para diferentes ambientes
4. [ ] Agregar logs y monitoreo
5. [ ] Implementar tests unitarios e integración

---

## Archivos de Configuración Importantes

### Backend
- **.env**: Variables de entorno (puerto, BD, JWT secret, etc.)
- **src/server.js**: Punto de entrada del servidor
- **package.json**: Scripts para `npm start` y `npm run dev`

### Frontend
- **angular.json**: Configuración de Angular CLI
- **tsconfig.json**: Configuración de TypeScript
- **src/app/app.routes.ts**: Definición de rutas

---

## Notas Importantes

- El frontend se ejecuta en puerto **4200** por defecto
- El backend se ejecuta en puerto **3000** por defecto (configurable en .env)
- CORS está configurado en el backend para permitir conexiones del frontend
- Ambas aplicaciones están listas para development con herramientas como nodemon (backend) y ng serve (frontend)

¡El proyecto está listo para empezar el desarrollo! 🚀
