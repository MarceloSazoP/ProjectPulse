
import axios from 'axios';

// URL del backend en producción
const API_URL = 'https://tu-dominio.com/api'; // Cambiar por la URL real en producción

export const apiClient = {
  login: async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  },

  // Otras operaciones de autenticación
  logout: async () => {
    try {
      const response = await axios.post(`${API_URL}/logout`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  },

  // Operaciones CRUD genéricas
  get: async (endpoint: string) => {
    try {
      const response = await axios.get(`${API_URL}${endpoint}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error(`Error al obtener datos de ${endpoint}:`, error);
      throw error;
    }
  },

  post: async (endpoint: string, data: any) => {
    try {
      const response = await axios.post(`${API_URL}${endpoint}`, data, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error(`Error al enviar datos a ${endpoint}:`, error);
      throw error;
    }
  },

  put: async (endpoint: string, data: any) => {
    try {
      const response = await axios.put(`${API_URL}${endpoint}`, data, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar datos en ${endpoint}:`, error);
      throw error;
    }
  },

  delete: async (endpoint: string) => {
    try {
      const response = await axios.delete(`${API_URL}${endpoint}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar datos de ${endpoint}:`, error);
      throw error;
    }
  }
};
import axios from 'axios';

// URL del backend en producción
const API_URL = 'https://tu-dominio.com/api';

// Cliente axios configurado para producción
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Funciones de autenticación
export const auth = {
  login: async (username: string, password: string) => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },
  logout: async () => {
    await apiClient.post('/auth/logout');
  },
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  }
};
