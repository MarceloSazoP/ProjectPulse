
# Backend de ProjectPulse

Este backend proporciona una API para el sistema de gestión de proyectos "ProjectPulse".

## Estructura de la Base de Datos

La base de datos está diseñada siguiendo un modelo relacional con PostgreSQL. Las principales entidades son:

- **Usuarios**: Información de usuarios del sistema
- **Perfiles**: Datos de perfil extendidos de los usuarios
- **Roles**: Roles de los usuarios (admin, manager, member, etc.)
- **Permisos**: Permisos específicos para cada rol
- **Departamentos**: Divisiones organizativas
- **Equipos**: Grupos de usuarios que trabajan juntos
- **Proyectos**: Proyectos con fechas, estado y descripción
- **Tableros Kanban**: Para la gestión ágil de tareas
- **Tareas Gantt**: Para planificación y seguimiento de cronogramas

## Endpoints de la API

La API proporciona los siguientes endpoints principales:

### Proyectos
- `GET /api/projects`: Obtener todos los proyectos
- `GET /api/projects/:id`: Obtener un proyecto por ID
- `POST /api/projects`: Crear un nuevo proyecto
- `PUT /api/projects/:id`: Actualizar un proyecto existente
- `DELETE /api/projects/:id`: Eliminar un proyecto
- `GET /api/projects/:projectId/teams`: Obtener equipos de un proyecto
- `POST /api/projects/team-assignment`: Asignar un equipo a un proyecto

### Tareas
- `GET /api/tasks`: Obtener todas las tareas
- `GET /api/tasks/:id`: Obtener una tarea por ID
- `GET /api/projects/:projectId/tasks`: Obtener tareas de un proyecto
- `POST /api/tasks`: Crear una nueva tarea
- `PUT /api/tasks/:id`: Actualizar una tarea existente
- `DELETE /api/tasks/:id`: Eliminar una tarea
- `POST /api/tasks/:taskId/assign`: Asignar una tarea a un usuario

Se irán implementando más endpoints a medida que se desarrollen nuevas funcionalidades.

## Configuración de Desarrollo

Para el desarrollo, este backend está configurado para simular las consultas a la base de datos, permitiendo el desarrollo sin necesidad de una conexión activa a PostgreSQL.

## Conexión a la Base de Datos

Para producción, se deben descomentar las líneas adecuadas en los archivos de servicios y habilitar la conexión real a la base de datos PostgreSQL "Pulsev1" con las credenciales:
- Usuario: postgres
- Contraseña: admin

## Tipos de Datos y Validación

Se utilizan esquemas de validación con Zod para garantizar la integridad de los datos que se envían a la API.
