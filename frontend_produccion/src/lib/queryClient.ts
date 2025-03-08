
import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

// URL del backend en producción
const API_BASE_URL = 'https://tu-dominio.com/api'; // Cambiar por la URL real en producción

// Crear cliente de consulta
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Helper para realizar peticiones a la API
export const apiRequest = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include' as RequestCredentials,
    body: data ? JSON.stringify(data) : undefined,
  };

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Error en la petición: ${response.status}`
    );
  }

  return response;
};
import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';

// URL del backend en producción
export const API_URL = 'https://tu-dominio.com/api';

// Configurar cliente de axios para las peticiones API
export const apiRequest = async (method: string, endpoint: string, data?: any) => {
  try {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Inicializar QueryClient con opciones por defecto
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});
