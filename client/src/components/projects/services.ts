
/**
 * Project Services
 * 
 * This file contains services for interacting with projects and tasks
 * using the API client.
 */

import { projectsApi, tasksApi } from '@/lib/api-client';

/**
 * SERVICIO DE PROYECTOS
 * 
 * Estos servicios utilizan el cliente API para comunicarse con el backend
 * Para producción:
 * 1. Asegúrate que la URL base en api-client.ts apunte a tu servidor
 * 2. El puerto de conexión debe estar abierto en el firewall del servidor
 * 3. Configura CORS en el servidor para permitir peticiones desde tu dominio
 */
export const projectService = {
  // Obtener todos los proyectos
  getAllProjects: async () => {
    try {
      return await projectsApi.getAll();
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },
  
  // Obtener un proyecto por ID
  getProjectById: async (id: number) => {
    try {
      return await projectsApi.getById(id);
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  },
  
  // Crear un nuevo proyecto
  createProject: async (projectData: any) => {
    try {
      return await projectsApi.create(projectData);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },
  
  // Actualizar un proyecto
  updateProject: async (id: number, projectData: any) => {
    try {
      return await projectsApi.update(id, projectData);
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  },
};

/**
 * SERVICIO DE TAREAS
 * 
 * Estos servicios gestionan las operaciones de tareas para el tablero Kanban
 * Para producción:
 * 1. El endpoint de tareas debe estar correctamente implementado en el backend
 * 2. Puede ser necesario ajustar el formato de los datos según el esquema de la BD
 */
export const taskService = {
  // Obtener todas las tareas de un proyecto
  getProjectTasks: async (projectId: number) => {
    try {
      return await tasksApi.getByProject(projectId);
    } catch (error) {
      console.error(`Error fetching tasks for project ${projectId}:`, error);
      throw error;
    }
  },
  
  // Crear una nueva tarea
  createTask: async (projectId: number, taskData: any) => {
    try {
      return await tasksApi.create(projectId, taskData);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },
  
  // Actualizar una tarea (cambiar status, asignado, etc)
  updateTask: async (taskId: number, taskData: any) => {
    try {
      return await tasksApi.update(taskId, taskData);
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
      throw error;
    }
  },
  
  // Mover una tarea entre columnas del tablero Kanban
  moveTask: async (taskId: number, newStatus: string, newPosition?: number) => {
    try {
      return await tasksApi.update(taskId, { 
        status: newStatus,
        position: newPosition
      });
    } catch (error) {
      console.error(`Error moving task ${taskId}:`, error);
      throw error;
    }
  },
};
