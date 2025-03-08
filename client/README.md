
# Frontend Configuration for Production

Este documento describe cómo configurar el frontend para un entorno de producción.

## Conexiones al Backend

Todas las conexiones al backend están centralizadas en:

- `src/lib/api-client.ts` - Cliente API base con Axios
- `src/components/projects/services.ts` - Servicios específicos que utilizan el cliente API

## Configuración para Producción

1. **Configurar URL del backend**

   Edita el archivo `src/lib/api-client.ts` y actualiza la variable `BASE_URL`:

   ```typescript
   // Cambiar esto para producción
   const BASE_URL = 'https://tu-dominio.com/api'; 
   ```

2. **Configuración del Servidor de Producción**

   - Asegúrate que el servidor esté escuchando en la IP correcta (0.0.0.0)
   - Configura las variables de entorno en el archivo `.env` del servidor
   - Abre los puertos necesarios en el firewall
   - Configura correctamente CORS para permitir peticiones desde tu dominio

3. **Construcción para Producción**

   Ejecuta el comando de construcción:

   ```bash
   npm run build
   ```

   Esto generará los archivos estáticos optimizados en la carpeta `dist/`.

4. **Despliegue de Archivos Estáticos**

   Sube los archivos de la carpeta `dist/` a tu servidor web (Nginx, Apache, etc.)

## Configuración CORS en el Backend

Para que el frontend pueda comunicarse con el backend en producción:

```typescript
// En tu archivo server/index.ts
app.use(cors({
  origin: 'https://tu-dominio-frontend.com',
  credentials: true
}));
```

## Variables de Entorno

Para producción, debes crear un archivo `.env` en la raíz del proyecto backend con:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=tu-clave-secreta-muy-fuerte
DB_URL=postgresql://usuario:password@host:puerto/nombre_db
CORS_ORIGIN=https://tu-dominio-frontend.com
```
