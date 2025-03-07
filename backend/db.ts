
import { PostgreSqlContainer, Pool } from 'pg';

// Configuración de la base de datos
const dbConfig = {
  user: 'postgres',
  password: 'admin',
  host: 'localhost', // Cambia esto a la dirección de tu servidor en producción
  port: 5432,
  database: 'Pulsev1',
};

// Creación del pool de conexiones (no se conectará realmente hasta que se use)
export const pool = new Pool(dbConfig);

// Función para realizar consultas a la base de datos
export async function query(text: string, params?: any[]) {
  try {
    // En producción, descomentar esto:
    // const client = await pool.connect();
    // const result = await client.query(text, params);
    // client.release();
    // return result.rows;
    
    // Simulación para desarrollo:
    console.log('Consulta SQL simulada:', text, params);
    return [];
  } catch (error) {
    console.error('Error en la consulta a la base de datos:', error);
    throw error;
  }
}

// Función para cerrar la conexión al finalizar
export async function closePool() {
  await pool.end();
}
