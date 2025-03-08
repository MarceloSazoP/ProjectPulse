
/**
 * Cliente API
 * 
 * Un cliente HTTP simple para realizar solicitudes a la API.
 * Esta clase se utiliza en los componentes para comunicarse con el backend.
 */

// PRODUCCIÓN: Descomentar y configurar para uso en producción
/*
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || '/api'
  : 'http://localhost:5000/api';

export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  body?: any,
  customHeaders?: Record<string, string>
) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders
  };

  // Añadir token de autenticación si está disponible
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    
    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    // Para respuestas 204 No Content, no intentar parsear JSON
    if (response.status === 204) {
      return { ok: true };
    }
    
    return response;
  } catch (error) {
    console.error(`API Request Error (${method} ${endpoint}):`, error);
    throw error;
  }
}
*/

// Implementación simulada para desarrollo
export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  body?: any,
  customHeaders?: Record<string, string>
) {
  console.log(`[DEV] API Request: ${method} ${endpoint}`);
  if (body) {
    console.log('[DEV] Request body:', body);
  }
  
  // Simular una respuesta exitosa
  return new Response(JSON.stringify({ success: true, message: 'API mock response' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
