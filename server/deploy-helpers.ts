
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer } from 'http';
import express from 'express';
import multer from 'multer';

// Obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createDeploymentPackage(outputPath: string = './deployment'): void {
  // Crear directorio de despliegue si no existe
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Copiar archivos necesarios del servidor
  const serverFiles = ['auth.ts', 'index.ts', 'routes.ts', 'seed.ts', 'storage.ts', 'deploy-helpers.ts'];
  const serverDir = path.join(outputPath, 'server');
  
  if (!fs.existsSync(serverDir)) {
    fs.mkdirSync(serverDir, { recursive: true });
  }
  
  serverFiles.forEach(file => {
    fs.copyFileSync(
      path.join(__dirname, file),
      path.join(serverDir, file)
    );
  });
  
  // Copiar archivos compartidos
  const sharedDir = path.join(outputPath, 'shared');
  if (!fs.existsSync(sharedDir)) {
    fs.mkdirSync(sharedDir, { recursive: true });
  }
  
  fs.copyFileSync(
    path.join(__dirname, '../shared/schema.ts'),
    path.join(sharedDir, 'schema.ts')
  );
  
  // Crear directorio para uploads
  const uploadsDir = path.join(outputPath, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  
  // Copiar package.json y adaptarlo para producción
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  
  // Simplificar el package.json para la implementación
  const deployPackage = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    scripts: {
      "start": "tsx server/index.ts",
      "build": "tsc",
      "prod": "node dist/server/index.js"
    },
    dependencies: {
      // Mantener solo las dependencias necesarias para el backend
      "dotenv": packageJson.dependencies.dotenv,
      "express": packageJson.dependencies.express,
      "express-session": packageJson.dependencies.["express-session"],
      "memorystore": packageJson.dependencies.memorystore,
      "multer": packageJson.dependencies.multer,
      "passport": packageJson.dependencies.passport,
      "passport-local": packageJson.dependencies.["passport-local"],
      "tsx": packageJson.dependencies.tsx,
      "typescript": packageJson.dependencies.typescript,
      "zod": packageJson.dependencies.zod
    },
    engines: {
      "node": ">=16.0.0"
    }
  };
  
  fs.writeFileSync(
    path.join(outputPath, 'package.json'),
    JSON.stringify(deployPackage, null, 2)
  );
  
  // Crear un README con instrucciones
  const readmeContent = `# Backend de Gestión de Proyectos

## Instrucciones de Instalación

1. Asegúrate de tener Node.js 16 o superior instalado
2. Ejecuta \`npm install\` para instalar las dependencias
3. Crea un archivo \`.env\` con la variable \`SESSION_SECRET=tu_clave_secreta\`

## Iniciar el servidor

Desarrollo:
\`\`\`
npm start
\`\`\`

Producción:
\`\`\`
npm run build
npm run prod
\`\`\`

El servidor se ejecutará en el puerto 5000 por defecto.

## Estructura de Carpetas

- \`/server\`: Código del servidor Express
- \`/shared\`: Esquemas y tipos compartidos
- \`/uploads\`: Carpeta donde se guardan los archivos subidos
`;

  fs.writeFileSync(
    path.join(outputPath, 'README.md'),
    readmeContent
  );
  
  // Crear un .env de ejemplo
  fs.writeFileSync(
    path.join(outputPath, '.env.example'),
    'SESSION_SECRET=cambia_esto_por_una_clave_secreta_aleatoria\n'
  );
  
  // Crear el tsconfig.json para la compilación
  const tsconfigContent = {
    "compilerOptions": {
      "target": "ES2020",
      "module": "NodeNext",
      "moduleResolution": "NodeNext",
      "esModuleInterop": true,
      "outDir": "./dist",
      "strict": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    },
    "include": ["server/**/*", "shared/**/*"],
    "exclude": ["node_modules"]
  };
  
  fs.writeFileSync(
    path.join(outputPath, 'tsconfig.json'),
    JSON.stringify(tsconfigContent, null, 2)
  );
  
  console.log(`Paquete de despliegue creado en ${path.resolve(outputPath)}`);
}

export function testBackendServer() {
  const app = express();
  app.use(express.json());
  
  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage });
  
  // Ruta simple para verificar que el servidor está funcionando
  app.get('/api/status', (req, res) => {
    res.json({ 
      status: 'ok',
      message: 'El servidor backend está funcionando correctamente',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // Prueba para subir archivos
  app.post('/api/test-upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }
    
    res.status(201).json({
      message: 'Archivo subido correctamente',
      file: {
        originalname: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  });
  
  // Crear el servidor HTTP
  const server = createServer(app);
  
  // Iniciar el servidor en el puerto 5001 para no interferir con el servidor principal
  server.listen({
    port: 5001,
    host: "0.0.0.0"
  }, () => {
    console.log('Servidor de prueba ejecutándose en el puerto 5001');
    console.log('Accede a http://0.0.0.0:5001/api/status para verificar');
  });
  
  return server;
}
