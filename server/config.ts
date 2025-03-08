
/**
 * SERVER CONFIGURATION
 * 
 * This file contains server configuration settings with production options.
 */

// Importaciones necesarias para la configuración
import dotenv from 'dotenv';

// Cargar variables de entorno desde archivo .env
dotenv.config();

/**
 * CONFIGURACIÓN DEL SERVIDOR
 * ===========================
 * 
 * PRODUCCIÓN:
 * 1. Crear un archivo .env en el directorio raíz del proyecto en producción
 * 2. Configurar las variables de entorno en ese archivo
 * 3. Asegurarse que el puerto esté abierto en el firewall
 * 4. Para un entorno de producción real, considerar usar un proxy inverso (Nginx/Apache)
 */
export const serverConfig = {
  // Puerto del servidor - usa 3000 por defecto o el puerto definido en las variables de entorno
  // PRODUCCIÓN: Configurar PORT en el archivo .env o en las variables de entorno del servidor
  port: process.env.PORT || 3000,
  
  // Host - usar 0.0.0.0 para aceptar conexiones desde cualquier dirección IP
  // PRODUCCIÓN: Mantener 0.0.0.0 para aceptar conexiones externas
  host: process.env.HOST || '0.0.0.0',
  
  // Entorno - desarrollo o producción
  // PRODUCCIÓN: Configurar NODE_ENV=production en el archivo .env o variables de entorno
  env: process.env.NODE_ENV || 'development',
  
  // Clave secreta para las sesiones y tokens JWT
  // PRODUCCIÓN: Configurar una clave secreta fuerte en el archivo .env
  // IMPORTANTE: No usar la clave por defecto en producción
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-replace-in-production',
  
  // Configuración de base de datos
  // PRODUCCIÓN: Configurar los parámetros de conexión a la base de datos en el archivo .env
  db: {
    // Tipo de base de datos: 'postgres', 'mysql', 'sqlite', etc.
    type: process.env.DB_TYPE || 'postgres',
    
    // URL de conexión para bases de datos tipo PostgreSQL, MySQL, etc.
    // PRODUCCIÓN: Configurar la URL completa en DB_URL en el archivo .env
    url: process.env.DB_URL || 'postgresql://postgres:admin@localhost:5432/project_pulse',
    
    // Parámetros individuales (alternativa a URL)
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'project_pulse',
  },
  
  // Configuración CORS para permitir peticiones desde dominios específicos
  // PRODUCCIÓN: Configurar los dominios permitidos en CORS_ORIGIN
  cors: {
    // Origen permitido - '*' permite cualquier origen (no recomendado para producción)
    // PRODUCCIÓN: Configurar dominios específicos, ej: 'https://mi-dominio.com'
    origin: process.env.CORS_ORIGIN || '*',
    
    // Si se permiten cookies en peticiones cross-origin
    credentials: true,
  }
};

export default serverConfig;
