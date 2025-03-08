
# Frontend de Project Pulse - Versión de Producción

Esta carpeta contiene la versión de producción del frontend de Project Pulse, configurada para conectarse a un servidor backend en producción.

## Configuración

Antes de compilar y desplegar el frontend, asegúrate de:

1. Editar la URL del backend en los siguientes archivos:
   - `src/lib/apiClient.ts`
   - `src/lib/queryClient.ts`
   - En cada componente que haga llamadas directas a axios (como `department-management.tsx`)

2. Actualizar la URL a la dirección donde se ejecutará tu backend, por ejemplo:
   ```typescript
   const API_URL = 'https://tu-dominio-real.com/api';
   ```

## Compilación para producción

Para compilar la aplicación para producción:

```bash
npm run build
```

Esto generará una carpeta `dist` con los archivos estáticos optimizados listos para ser desplegados.

## Despliegue

Puedes desplegar los archivos generados en cualquier servicio de hosting estático como:
- Replit Deployments
- Netlify
- Vercel
- GitHub Pages
- Amazon S3
- Firebase Hosting

## Notas importantes

- Asegúrate de que tu servidor backend tenga CORS configurado correctamente para permitir peticiones desde el dominio donde estará alojado este frontend.
- Configura correctamente las variables de entorno en el servidor backend.
- Si utilizas autenticación basada en cookies, asegúrate de configurar `withCredentials: true` en todas las peticiones axios.
