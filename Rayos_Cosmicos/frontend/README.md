# Frontend - Rayos Cosmicos Web Application

Frontend desarrollado con Angular 17 para el sistema web de Rayos Cosmicos.

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/          # Páginas principales
│   │   ├── services/       # Servicios (llamadas API, lógica compartida)
│   │   ├── models/         # Interfaces y modelos de datos
│   │   ├── guards/         # Guards de rutas
│   │   ├── app.routes.ts   # Rutas de la aplicación
│   │   ├── app.config.ts   # Configuración de Angular
│   │   └── app.component.* # Componente raíz
│   ├── assets/             # Imágenes, iconos, etc.
│   ├── styles.css          # Estilos globales
│   ├── main.ts             # Punto de entrada
│   └── index.html          # HTML principal
├── angular.json            # Configuración de Angular
├── tsconfig.json           # Configuración de TypeScript
└── README.md              # Este archivo
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

## Scripts Disponibles

- `npm start` - Ejecutar servidor de desarrollo en `http://localhost:4200/`
- `npm run build` - Compilar para producción (output en `dist/`)
- `npm run watch` - Compilar en modo watch para desarrollo
- `npm test` - Ejecutar pruebas unitarias

## Servidor de Desarrollo

```bash
npm start
```

Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si cambias algún archivo source.

## Generar Componentes

```bash
# Generar componente
ng generate component nombre-componente

# Generar servicio
ng generate service nombre-servicio

# Generar modelo
ng generate interface nombre-modelo
```

## Compilar para Producción

```bash
npm run build
```

Los artefactos compilados se almacenarán en el directorio `dist/`.

## Próximos Pasos

- [ ] Crear estructura de componentes modularizados
- [ ] Crear servicios para consumir API del backend
- [ ] Implementar sistema de autenticación
- [ ] Crear página de login/registro
- [ ] Crear página de dashboard
- [ ] Implementar manejo de estado (si es necesario)
- [ ] Agregar estilos CSS/Bootstrap
- [ ] Agregar validación de formularios

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
