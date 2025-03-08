/**
 * API Client
 * 
 * Cliente para interactuar con el servicio de API.
 * Provee métodos para autenticación y manejo de sesión.
 */

import { apiService } from '../services/api';

// Estado de la aplicación
let currentUser = null;
const listeners = new Set<() => void>();

// Notificar a todos los componentes suscritos cuando el usuario cambia
const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const apiClient = {
  // Autenticación
  login: async (username: string, password: string) => {
    try {
      currentUser = await apiService.login(username, password);
      notifyListeners();
      return currentUser;
    } catch (error) {
      console.error('Error de login:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiService.logout();
      currentUser = null;
      notifyListeners();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  },

  getUser: () => currentUser,

  // Verifica si el usuario está autenticado
  isAuthenticated: () => !!currentUser,

  // Verifica el rol del usuario
  hasRole: (role: string) => currentUser?.role === role,

  // Método para inicializar el estado del usuario al cargar la app
  initAuth: async () => {
    try {
      currentUser = await apiService.getCurrentUser();
      notifyListeners();
    } catch (error) {
      console.error('Error al inicializar la autenticación:', error);
    }
  },

  // Suscribirse a los cambios de usuario
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};

// Inicializar la autenticación al importar el módulo
apiClient.initAuth();