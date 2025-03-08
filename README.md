
# Gestor de Proyectos - Project Pulse

Un sistema de gestión de proyectos completo con tableros Kanban, diagramas Gantt y gestión de equipos.

## Arquitectura del Proyecto

La aplicación está estructurada siguiendo una arquitectura cliente-servidor:

### Backend

- **Server**: Contiene la implementación principal del backend
  - `index.ts`: Punto de entrada del servidor
  - `routes.ts`: Definición de todas las rutas de la API
  - `storage.ts`: Capa de acceso a datos
  - `auth.ts`: Implementación de autenticación
  - `config.ts`: Configuración del servidor
  - `seed.ts`: Datos iniciales para desarrollo
  - `vite.ts`: Configuración de Vite para desarrollo

- **Shared**: Esquemas y tipos compartidos entre frontend y backend
  - `schema.ts`: Definiciones de tablas, validación con Zod y tipos TypeScript

### Frontend

- **Client**: Aplicación frontend
  - `src/`: Código fuente principal
    - `components/`: Componentes React
    - `services/`: Servicios para comunicación con la API
    - `lib/`: Utilidades y funciones auxiliares
    - `hooks/`: Hooks personalizados de React

## Estructura de Conexiones

### Conexiones API

Para mantener una arquitectura robusta y evitar duplicaciones, todas las llamadas a la API desde el frontend están centralizadas en:

1. `client/src/services/api.ts`: Implementa servicios específicos para cada entidad
2. `client/src/lib/apiClient.ts`: Cliente HTTP básico para realizar peticiones

Las conexiones están comentadas en desarrollo y deben descomentarse en producción.

### Conexiones a Base de Datos

En el backend, las conexiones a la base de datos están implementadas en `server/storage.ts`. En desarrollo, se utilizan datos simulados, mientras que en producción se debe descomentar el código para utilizar la conexión real a PostgreSQL.

## Configuración para Producción

### Backend

1. En `server/storage.ts`, descomentar las líneas de conexión a la base de datos
2. En `server/routes.ts`, descomentar las líneas para utilizar la conexión real
3. Configurar las variables de entorno en un archivo `.env`:
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=tu-clave-secreta-muy-fuerte
   DB_URL=postgresql://usuario:password@host:puerto/nombre_db
   CORS_ORIGIN=https://tu-dominio.com
   ```

### Frontend

1. En `client/src/services/api.ts`, descomentar las funciones de servicio
2. En `client/src/lib/apiClient.ts`, descomentar y configurar la implementación de producción

## Despliegue

Para desplegar la aplicación, utiliza el script de despliegue:

```
npm run deploy
```

Esto generará un paquete de despliegue en la carpeta `deployment/` con todos los archivos necesarios para producción.
