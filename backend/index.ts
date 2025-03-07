
import express from 'express';
import cors from 'cors';
import routes from './routes';
import { initializeDatabase } from './db';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Documentación básica de la API
app.get('/', (req, res) => {
  res.json({
    message: 'API del Gestor de Proyectos',
    endpoints: {
      projects: '/api/projects',
      tasks: '/api/tasks',
      kanban: {
        boards: '/api/kanban/boards',
        columns: '/api/kanban/columns',
        cards: '/api/kanban/cards'
      },
      gantt: {
        tasks: '/api/gantt/tasks'
      }
    }
  });
});

// Rutas de la API
app.use('/api', routes);

// Inicializar la base de datos
initializeDatabase()
  .then(initialized => {
    if (initialized) {
      // Iniciar el servidor
      app.listen(PORT, () => {
        console.log(`Servidor backend ejecutándose en el puerto ${PORT}`);
      });
    } else {
      console.error('No se pudo inicializar la base de datos. El servidor no se iniciará.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Error al inicializar la aplicación:', error);
    process.exit(1);
  });

// Manejar señales de cierre para cerrar la base de datos correctamente
process.on('SIGINT', async () => {
  console.log('Cerrando la aplicación...');
  process.exit(0);
});

export default app;
