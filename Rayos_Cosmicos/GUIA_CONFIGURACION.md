# Guía de Configuración - Rayos Cosmicos Web System

## ⚠️ Problema de Versión de Node.js

Tu sistema tiene **Node.js v20.14.0**, pero Angular 17 requiere **v20.19.0 o v22.12.0**.

### Soluciones

#### Opción 1: Usar versión antigua de Angular (Recomendado si no quieres actualizar Node)
```bash
cd frontend
npm install @angular/cli@16 --save-dev
npx ng version
```

#### Opción 2: Actualizar Node.js (Recomendado)

**En Windows (usando PowerShell como Administrador):**

1. Descargar e instalar Node.js LTS desde: https://nodejs.org/
2. Elegir versión 22.12.0 o superior
3. Instalar y reiniciar la terminal
4. Verificar: `node --version`

**Alternativas:**
- **nvm-windows**: Gestor de versiones para Windows
- **Chocolatey**: `choco install nodejs --version=22.12.0`

---

## Estructura Completa Instalada

### Frontend - Angular 17
```
frontend/
├── src/app/
│   ├── components/       ✅ Carpeta creada
│   ├── pages/           ✅ Carpeta creada
│   ├── services/        ✅ Carpeta creada
│   ├── models/          ✅ Carpeta creada
│   ├── guards/          ✅ Carpeta creada
│   ├── app.routes.ts    ✅ Rutas configuradas
│   └── app.component.*  ✅ Componente raíz
├── package.json         ✅ 883 paquetes instalados
└── node_modules/        ✅ Dependencias listas
```

**Dependencias instaladas:**
- @angular/core, @angular/common, @angular/forms, @angular/router
- TypeScript
- RxJS
- Zona.js

### Backend - Express + Node.js
```
backend/
├── src/
│   ├── controllers/      ✅ Carpeta creada
│   ├── models/          ✅ Carpeta creada
│   ├── routes/          ✅ Carpeta creada
│   ├── middlewares/     ✅ Carpeta creada
│   ├── config/          ✅ Carpeta creada
│   ├── utils/           ✅ Carpeta creada
│   └── server.js        ✅ Servidor base
├── .env                 ✅ Variables de entorno
├── package.json         ✅ 96 paquetes instalados
└── node_modules/        ✅ Dependencias listas
```

**Dependencias instaladas:**
- express (5.2.1)
- cors (2.8.6)
- dotenv (17.4.2)
- nodemon (3.1.14)

---

## Cómo Ejecutar (Una vez actualices Node si es necesario)

### Terminal 1: Backend
```bash
cd Rayos_Cosmicos/backend
npm run dev
```
✅ Servidor ejecutándose en `http://localhost:3000/`

### Terminal 2: Frontend
```bash
cd Rayos_Cosmicos/frontend
npm start
```
✅ Aplicación ejecutándose en `http://localhost:4200/`

---

## Próximas Tareas de Desarrollo

### 1. Configurar Base de Datos (Backend)
```bash
cd backend
npm install mongodb mongoose
# o
npm install pg
```

### 2. Crear Primer Modelo (Backend)
Crear archivo: `src/models/usuario.model.js`
```javascript
// Ejemplo con Mongoose
const usuarioSchema = new Schema({
  nombre: String,
  email: String,
  contraseña: String
});
```

### 3. Crear Primer Controlador (Backend)
Crear archivo: `src/controllers/usuario.controller.js`

### 4. Crear Rutas (Backend)
Crear archivo: `src/routes/usuarios.js`

### 5. Crear Servicios Angular (Frontend)
```bash
ng generate service api
ng generate service auth
```

### 6. Crear Componentes Angular (Frontend)
```bash
ng generate component components/navbar
ng generate component pages/home
ng generate component pages/login
```

---

## Scripts Disponibles

### Backend
- `npm run dev` - Ejecutar con nodemon (reinicia automáticamente)
- `npm start` - Ejecutar servidor en modo producción

### Frontend
- `npm start` - Servidor de desarrollo con hot reload
- `npm run build` - Compilar para producción
- `npm run watch` - Compilar en modo watch
- `npm test` - Ejecutar pruebas

---

## Checklist de Configuración Inicial ✅

- [x] Angular instalado en `/frontend`
- [x] Express instalado en `/backend`
- [x] Carpetas modularizadas creadas
- [x] npm install ejecutado en ambas carpetas
- [x] Variables de entorno configuradas (.env)
- [x] Scripts npm configurados
- [x] Servidor backend funcional (verificado)
- [ ] **Actualizar Node.js a v20.19+ o v22.12+**
- [ ] Verificar frontend con `ng version`
- [ ] Probar `npm start` en frontend

---

## Recursos Útiles

- Angular Docs: https://angular.io/docs
- Express Docs: https://expressjs.com/
- Node.js Docs: https://nodejs.org/docs/
- TypeScript: https://www.typescriptlang.org/

---

## Próximos Pasos Inmediatos

1. **Actualiza Node.js** a una versión compatible
2. **Verifica la instalación**: 
   ```bash
   node --version
   npm --version
   cd frontend && ng version
   ```
3. **Prueba ambos servidores** en terminales separadas
4. **Comienza el desarrollo**: Crea modelos, servicios y componentes

¡Todo está listo para desarrollar! 🚀
