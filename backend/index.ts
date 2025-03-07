
import express from 'express';
import cors from 'cors';
import routes from './routes';

// Crear la aplicación de Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configurar las rutas
app.use('/api/v1', routes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API de Pulsev1 funcionando correctamente' });
});

// Función para iniciar el servidor en producción
export function startServer() {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor backend corriendo en puerto ${PORT}`);
  });
}

// Exportar la app para poder usarla en pruebas o en otros contextos
export default app;
