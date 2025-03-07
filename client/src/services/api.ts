/**
 * API Service
 * 
 * Este servicio maneja todas las conexiones con el backend.
 * Para desarrollo, utiliza datos mock. En producción, conecta con el backend real.
 */

// Tipos de usuario
interface User {
  id: number;
  username: string;
  role: string;
}

// Usuario ficticio para desarrollo
const mockUser: User = {
  id: 1,
  username: 'admin',
  role: 'admin'
};

// Servicio de API
export const apiService = {
  // Autenticación
  login: async (username: string, password: string): Promise<User> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real al backend
    // const response = await fetch('/api/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ username, password }),
    //   credentials: 'include'
    // });
    // if (!response.ok) throw new Error('Error de autenticación');
    // return response.json();

    // Simular una respuesta del servidor
    if (username === 'admin' && password === 'admin123') {
      return mockUser;
    } else {
      throw new Error('Credenciales incorrectas');
    }
  },

  logout: async (): Promise<void> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real al backend
    // const response = await fetch('/api/logout', {
    //   method: 'POST',
    //   credentials: 'include'
    // });
    // if (!response.ok) throw new Error('Error al cerrar sesión');

    // En desarrollo, no hace nada
    console.log('Usuario desconectado');
    return Promise.resolve();
  },

  getCurrentUser: async (): Promise<User | null> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real al backend
    // try {
    //   const response = await fetch('/api/user', {
    //     credentials: 'include'
    //   });
    //   if (!response.ok) return null;
    //   return response.json();
    // } catch (error) {
    //   return null;
    // }

    // En desarrollo, siempre devuelve el usuario mock
    return Promise.resolve(mockUser);
  }
};

// Servicios para Proyectos
export const projectService = {
  // PRODUCCIÓN: Descomentar estas funciones cuando estés listo para usarlas
  /*
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (projectData: any) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  update: async (id: number, projectData: any) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  getProjectTeams: async (projectId: number) => {
    const response = await api.get(`/projects/${projectId}/teams`);
    return response.data;
  },

  assignTeam: async (projectId: number, teamId: number) => {
    const response = await api.post('/projects/team-assignment', { projectId, teamId });
    return response.data;
  }
  */
};

// Servicios para Tareas
export const taskService = {
  // PRODUCCIÓN: Descomentar estas funciones cuando estés listo para usarlas
  /*
  getAll: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  getByProject: async (projectId: number) => {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data;
  },

  create: async (taskData: any) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  createForProject: async (projectId: number, taskData: any) => {
    const response = await api.post(`/projects/${projectId}/tasks`, taskData);
    return response.data;
  },

  update: async (id: number, taskData: any) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  assignToUser: async (taskId: number, userId: number) => {
    const response = await api.post(`/tasks/${taskId}/assign`, { userId });
    return response.data;
  }
  */
};


// Servicios para Equipos
export const teamService = {
  // PRODUCCIÓN: Descomentar estas funciones cuando estés listo para usarlas
  /*
  getAll: async () => {
    const response = await api.get('/teams');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  create: async (teamData: any) => {
    const response = await api.post('/teams', teamData);
    return response.data;
  },

  update: async (id: number, teamData: any) => {
    const response = await api.put(`/teams/${id}`, teamData);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  },

  getMembers: async (teamId: number) => {
    const response = await api.get(`/teams/${teamId}/members`);
    return response.data;
  },

  addMember: async (teamId: number, userId: number) => {
    const response = await api.post(`/teams/${teamId}/members`, { userId });
    return response.data;
  },

  removeMember: async (teamId: number, userId: number) => {
    const response = await api.delete(`/teams/${teamId}/members/${userId}`);
    return response.data;
  }
  */
};

// Servicios para el tablero Kanban
export const kanbanService = {
  // PRODUCCIÓN: Descomentar estas funciones cuando estés listo para usarlas
  /*
  getBoards: async () => {
    const response = await api.get('/kanban/boards');
    return response.data;
  },

  getBoardById: async (id: number) => {
    const response = await api.get(`/kanban/boards/${id}`);
    return response.data;
  },

  getBoardsByProject: async (projectId: number) => {
    const response = await api.get(`/projects/${projectId}/kanban`);
    return response.data;
  },

  createBoard: async (boardData: any) => {
    const response = await api.post('/kanban/boards', boardData);
    return response.data;
  },

  updateBoard: async (id: number, boardData: any) => {
    const response = await api.put(`/kanban/boards/${id}`, boardData);
    return response.data;
  },

  deleteBoard: async (id: number) => {
    const response = await api.delete(`/kanban/boards/${id}`);
    return response.data;
  },

  getColumns: async (boardId: number) => {
    const response = await api.get(`/kanban/boards/${boardId}/columns`);
    return response.data;
  },

  createColumn: async (columnData: any) => {
    const response = await api.post('/kanban/columns', columnData);
    return response.data;
  },

  updateColumn: async (id: number, columnData: any) => {
    const response = await api.put(`/kanban/columns/${id}`, columnData);
    return response.data;
  },

  deleteColumn: async (id: number) => {
    const response = await api.delete(`/kanban/columns/${id}`);
    return response.data;
  },

  getCards: async (columnId: number) => {
    const response = await api.get(`/kanban/columns/${columnId}/cards`);
    return response.data;
  },

  createCard: async (cardData: any) => {
    const response = await api.post('/kanban/cards', cardData);
    return response.data;
  },

  updateCard: async (id: number, cardData: any) => {
    const response = await api.put(`/kanban/cards/${id}`, cardData);
    return response.data;
  },

  deleteCard: async (id: number) => {
    const response = await api.delete(`/kanban/cards/${id}`);
    return response.data;
  },

  assignCardToUser: async (cardId: number, userId: number) => {
    const response = await api.post(`/kanban/cards/${cardId}/assign`, { userId });
    return response.data;
  }
  */
};

// Servicios para el diagrama Gantt
export const ganttService = {
  // PRODUCCIÓN: Descomentar estas funciones cuando estés listo para usarlas
  /*
  getTasks: async () => {
    const response = await api.get('/gantt/tasks');
    return response.data;
  },

  getTasksByProject: async (projectId: number) => {
    const response = await api.get(`/projects/${projectId}/gantt`);
    return response.data;
  },

  createTask: async (taskData: any) => {
    const response = await api.post('/gantt/tasks', taskData);
    return response.data;
  },

  updateTask: async (id: number, taskData: any) => {
    const response = await api.put(`/gantt/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id: number) => {
    const response = await api.delete(`/gantt/tasks/${id}`);
    return response.data;
  },

  assignTaskToUser: async (taskId: number, userId: number) => {
    const response = await api.post(`/gantt/tasks/${taskId}/assign`, { userId });
    return response.data;
  },

  addDependency: async (dependencyData: any) => {
    const response = await api.post('/gantt/tasks/dependencies', dependencyData);
    return response.data;
  },

  removeDependency: async (id: number) => {
    const response = await api.delete(`/gantt/tasks/dependencies/${id}`);
    return response.data;
  }
  */
};

import axios from 'axios';

// Configurar la URL base del API según el entorno
const API_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || '/api'
  : 'http://localhost:5000/api';

// Configurar axios con la URL base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para enviar cookies en peticiones cross-origin
});

// Interceptor para manejar tokens de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default {
  projectService,
  taskService,
  apiService,
  teamService,
  kanbanService,
  ganttService,
};