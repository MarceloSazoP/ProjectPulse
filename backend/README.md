
# Backend API para Pulsev1

Este directorio contiene el backend para el sistema de gestión de proyectos Pulsev1, diseñado para conectarse a una base de datos PostgreSQL.

## Estructura

- `index.ts`: Punto de entrada principal del backend
- `db.ts`: Configuración de la conexión a la base de datos
- `routes.ts`: Definición de rutas de la API
- `controllers/`: Controladores para cada entidad
- `services/`: Servicios de negocio para cada entidad
- `schemas/`: Esquemas de validación usando Zod
- `sql/`: Scripts SQL para la creación de tablas
- `deploy-helpers.ts`: Funciones auxiliares para el despliegue

## Configuración para producción

Para usar este backend en producción, debes:

1. Tener una base de datos PostgreSQL llamada "Pulsev1" configurada
2. Editar `db.ts` para usar los parámetros de conexión correctos
3. Descomentar las líneas relevantes que están marcadas para producción
4. Ejecutar el script SQL en `sql/create_tables.sql` para crear las tablas necesarias

## API Endpoints

### Proyectos
- `GET /api/v1/projects`: Obtener todos los proyectos
- `GET /api/v1/projects/:id`: Obtener un proyecto por ID
- `POST /api/v1/projects`: Crear un nuevo proyecto
- `PUT /api/v1/projects/:id`: Actualizar un proyecto existente
- `DELETE /api/v1/projects/:id`: Eliminar un proyecto

### Tareas
- `GET /api/v1/tasks`: Obtener todas las tareas
- `GET /api/v1/projects/:projectId/tasks`: Obtener tareas de un proyecto
- `GET /api/v1/tasks/:id`: Obtener una tarea por ID
- `POST /api/v1/tasks`: Crear una nueva tarea
- `PUT /api/v1/tasks/:id`: Actualizar una tarea existente
- `DELETE /api/v1/tasks/:id`: Eliminar una tarea

## Uso

Este backend está actualmente configurado para desarrollo (no se conecta realmente a la base de datos). 
Para usar en producción, busca comentarios que indican "En producción, descomentar..." y habilita ese código.
