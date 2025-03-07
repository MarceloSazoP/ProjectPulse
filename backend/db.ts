
import { Pool } from 'pg';

// Configuración de la conexión a la base de datos Postgres
const pool = new Pool({
  host: 'localhost',
  database: 'Pulsev1',
  user: 'postgres',
  password: 'admin',
  port: 5432,
});

// Función para realizar consultas a la base de datos
export async function query(text: string, params?: any[]): Promise<any[]> {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`Tiempo de ejecución de la consulta: ${duration}ms, filas: ${res.rowCount}`);
    return res.rows;
  } catch (error) {
    console.error('Error en la consulta a la base de datos:', error);
    throw error;
  }
}

// Inicialización de la conexión
export async function initializeDatabase() {
  try {
    // Comprueba la conexión
    const client = await pool.connect();
    console.log('Conexión a la base de datos establecida correctamente');
    client.release();
    
    // Cargar esquema de la base de datos
    try {
      const fs = require('fs');
      const path = require('path');
      const createTablesSql = fs.readFileSync(path.join(__dirname, 'sql/create_tables.sql'), 'utf8');
      
      await pool.query(createTablesSql);
      console.log('Esquema de la base de datos creado/actualizado correctamente');
    } catch (schemaError) {
      console.error('Error al crear/actualizar el esquema de la base de datos:', schemaError);
    }
    
    return true;
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    
    // En desarrollo, podemos simular que la conexión fue exitosa
    if (process.env.NODE_ENV === 'development') {
      console.log('Simulando conexión exitosa en modo desarrollo');
      return true;
    }
    
    return false;
  }
}

// Función para cerrar la conexión a la base de datos
export async function closeDatabase() {
  try {
    await pool.end();
    console.log('Conexión a la base de datos cerrada correctamente');
    return true;
  } catch (error) {
    console.error('Error al cerrar la conexión a la base de datos:', error);
    return false;
  }
}
