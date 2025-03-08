
/**
 * API Client Utility
 * 
 * This file manages all backend API connections with appropriate error handling.
 * For production deployment, update the BASE_URL to your production server address.
 */

import axios from 'axios';

// CONFIGURACIÓN DEL CLIENTE API
// En desarrollo, el servidor de Vite proxea las peticiones al backend en el mismo puerto
// Para producción, debes cambiar esta URL a la dirección del servidor backend
// Ejemplo: https://tu-dominio.com/api o https://api.tu-dominio.com

// DEVELOPMENT: Uses the Vite proxy to forward requests to the backend on port 5000
// PRODUCTION: Change this to your production backend URL
const BASE_URL = '/api'; 

// API client instance with default configuration
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Allows cookies/credentials to be sent with requests
  withCredentials: true,
});

// Request interceptor - can be used to add auth tokens
apiClient.interceptors.request.use(
  (config) => {
    // For production with JWT auth, uncomment this:
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', error);
    }
    
    // Handle specific error codes
    if (error.response) {
      // Authentication errors
      if (error.response.status === 401) {
        // For production, redirect to login
        // window.location.href = '/login';
      }
      
      // Server errors
      if (error.response.status >= 500) {
        console.error('Server error occurred');
      }
    }
    
    return Promise.reject(error);
  }
);

// API service functions

/**
 * Projects API
 */
export const projectsApi = {
  // Get all projects
  getAll: async () => {
    const response = await apiClient.get('/projects');
    return response.data;
  },
  
  // Get project by ID
  getById: async (id: number) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },
  
  // Create new project
  create: async (projectData: any) => {
    const response = await apiClient.post('/projects', projectData);
    return response.data;
  },
  
  // Update project
  update: async (id: number, projectData: any) => {
    const response = await apiClient.put(`/projects/${id}`, projectData);
    return response.data;
  },
  
  // Delete project
  delete: async (id: number) => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },
};

/**
 * Tasks API
 */
export const tasksApi = {
  // Get all tasks for a project
  getByProject: async (projectId: number) => {
    const response = await apiClient.get(`/projects/${projectId}/tasks`);
    return response.data;
  },
  
  // Create new task
  create: async (projectId: number, taskData: any) => {
    const response = await apiClient.post(`/projects/${projectId}/tasks`, taskData);
    return response.data;
  },
  
  // Update task
  update: async (taskId: number, taskData: any) => {
    const response = await apiClient.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },
  
  // Delete task
  delete: async (taskId: number) => {
    const response = await apiClient.delete(`/tasks/${taskId}`);
    return response.data;
  },
};

/**
 * Users API
 */
export const usersApi = {
  // Get all users
  getAll: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },
  
  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get('/user');
    return response.data;
  },
};

/**
 * Authentication API
 */
export const authApi = {
  // Login
  login: async (credentials: { username: string; password: string }) => {
    const response = await apiClient.post('/login', credentials);
    return response.data;
  },
  
  // Register
  register: async (userData: any) => {
    const response = await apiClient.post('/register', userData);
    return response.data;
  },
  
  // Logout
  logout: async () => {
    const response = await apiClient.post('/logout');
    return response.data;
  },
};

export default apiClient;
