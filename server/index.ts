import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer } from 'http';
import router from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedAdminUser } from "./seed";
import * as auth from './auth';

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
app.use('/api/projects/:projectId/files', upload.array('files'));


app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Seed admin user
  await seedAdminUser();

  // Setup authentication
  auth.setupAuth(app);
  
  // Register API routes
  app.use('/api', router);
  
  const server = createServer(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Usar la configuración importada
  const { serverConfig } = await import('./config.js');
  const PORT = serverConfig.port;
  
  server.listen({
    port: PORT,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${PORT}`);
  }).on('error', (err) => {
    log(`Failed to start server: ${err.message}`);
    if (err.code === 'EADDRINUSE') {
      log(`Port ${PORT} is already in use. Please make sure the port is available.`);
    }
    process.exit(1);
  });
})();