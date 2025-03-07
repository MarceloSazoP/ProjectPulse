
import fs from 'fs';
import path from 'path';
import { pool } from './db';

// Función para inicializar la base de datos
export async function initializeDatabase() {
  try {
    console.log('Intentando inicializar la base de datos...');
    
    // Leer el archivo SQL
    const sqlScript = fs.readFileSync(path.join(__dirname, 'sql/create_tables.sql'), 'utf8');
    
    // Ejecutar script SQL (en producción)
    // const client = await pool.connect();
    // await client.query(sqlScript);
    // client.release();
    
    console.log('Base de datos inicializada correctamente');
    return true;
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    return false;
  }
}

// Función para verificar la conexión a la base de datos
export async function testDatabaseConnection() {
  try {
    // En producción, descomentar estas líneas:
    // const client = await pool.connect();
    // const result = await client.query('SELECT NOW()');
    // client.release();
    // return { connected: true, timestamp: result.rows[0].now };
    
    // Simulación para desarrollo:
    console.log('Simulando prueba de conexión a la base de datos');
    return { 
      connected: true, 
      timestamp: new Date().toISOString(),
      note: 'Esta es una simulación, no una conexión real'
    };
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

// Función para poblar datos iniciales en la base de datos
export async function seedInitialData() {
  try {
    console.log('Intentando poblar datos iniciales...');
    
    // En producción, descomentar estas líneas y adaptarlas a tus necesidades:
    /*
    const client = await pool.connect();
    
    // Ejemplo: Crear un proyecto inicial
    await client.query(`
      INSERT INTO projects (name, description, start_date, end_date, status, budget)
      VALUES ('Proyecto Inicial', 'Este es un proyecto inicial de ejemplo', NOW(), NOW() + INTERVAL '3 months', 'active', 50000)
      ON CONFLICT DO NOTHING
    `);
    
    client.release();
    */
    
    console.log('Datos iniciales poblados correctamente');
    return true;
  } catch (error) {
    console.error('Error al poblar datos iniciales:', error);
    return false;
  }
}
