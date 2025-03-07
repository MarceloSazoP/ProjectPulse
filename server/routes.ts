import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProjectSchema, insertTaskSchema, insertTeamSchema, insertDepartmentSchema, insertProfileSchema, insertUserSchema } from "@shared/schema";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Project routes
  app.get("/api/projects", requireAuth, async (req, res) => {
    const projects = await storage.getProjects();
    res.json(projects);
  });

  app.post("/api/projects", requireAuth, async (req, res) => {
    const projectData = insertProjectSchema.parse(req.body);
    const project = await storage.createProject(projectData);
    res.status(201).json(project);
  });

  app.put("/api/projects/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const project = await storage.updateProject(id, req.body);
    res.json(project);
  });

  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteProject(id);
    res.sendStatus(204);
  });

  // File upload routes for projects
  app.post("/api/projects/:projectId/files", requireAuth, async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const userId = req.user?.id;
    
    // Check if multer is available to handle file uploads
    if (!req.files && !req.file) {
      return res.status(400).json({ message: "No files were uploaded" });
    }
    
    try {
      // Process uploaded files
      const files = Array.isArray(req.files) ? req.files : [req.file];
      
      // Validate file types - only allow .zip and .rar
      for (const file of files) {
        const fileExt = path.extname(file.originalname).toLowerCase();
        if (fileExt !== '.zip' && fileExt !== '.rar') {
          // Delete the uploaded file if it's not a valid type
          try {
            fs.unlinkSync(path.join(__dirname, '../uploads', file.filename));
          } catch (err) {
            console.error("Error deleting invalid file:", err);
          }
          return res.status(400).json({ 
            message: "Solo se permiten archivos comprimidos (.zip o .rar)" 
          });
        }
      }
      
      // Format the date as yyyy-mm-dd
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      // Create new filenames with the format: Proyecto_{idproyecto}_{año-mes-dia}_{id_usuario}.extension
      const filenames = files.map(file => {
        const originalExt = path.extname(file.originalname);
        const newFilename = `Proyecto_${projectId}_${formattedDate}_${userId}${originalExt}`;
        
        // Get the correct paths using __dirname
        const uploadDir = path.join(__dirname, '../uploads');
        
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Rename the file
        fs.renameSync(
          path.join(uploadDir, file.filename), 
          path.join(uploadDir, newFilename)
        );
        
        return newFilename;
      });
      
      // Store file references in project
      await storage.addProjectFiles(projectId, filenames);
      
      res.status(201).json({ filenames });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Error processing file upload" });
    }
  });
  
  app.get("/api/projects/:projectId/files", requireAuth, async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    try {
      const files = await storage.getProjectFiles(projectId);
      res.json(files);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving project files" });
    }
  });
  
  // Ruta para descargar un archivo específico
  app.get("/api/projects/:projectId/files/:filename/download", async (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    try {
      if (fs.existsSync(filePath)) {
        res.download(filePath);
      } else {
        res.status(404).json({ message: "Archivo no encontrado" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error al descargar el archivo" });
    }
  });
  
  app.delete("/api/projects/:projectId/files/:filename", requireAuth, async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const { filename } = req.params;
    
    try {
      await storage.removeProjectFile(projectId, filename);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Error deleting file" });
    }
  });

  // Task routes
  app.get("/api/projects/:projectId/tasks", requireAuth, async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    const tasks = await storage.getTasks(projectId);
    res.json(tasks);
  });

  app.post("/api/tasks", requireAuth, async (req, res) => {
    const taskData = insertTaskSchema.parse(req.body);
    const task = await storage.createTask(taskData);
    res.status(201).json(task);
  });

  app.put("/api/tasks/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const task = await storage.updateTask(id, req.body);
    res.json(task);
  });

  app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteTask(id);
    res.sendStatus(204);
  });

  // Team routes
  app.get("/api/teams", requireAuth, async (req, res) => {
    const teams = await storage.getTeams();
    res.json(teams);
  });

  app.post("/api/teams", requireAuth, async (req, res) => {
    const teamData = insertTeamSchema.parse(req.body);
    const team = await storage.createTeam(teamData);
    res.status(201).json(team);
  });

  app.put("/api/teams/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const team = await storage.updateTeam(id, req.body);
    res.json(team);
  });

  app.delete("/api/teams/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteTeam(id);
    res.sendStatus(204);
  });

  // Kanban specific endpoints
  app.put("/api/tasks/:taskId/status", requireAuth, async (req, res) => {
    const taskId = parseInt(req.params.taskId);
    const { status } = req.body;
    const task = await storage.updateTask(taskId, { status });
    res.json(task);
  });

  app.put("/api/tasks/:taskId/assignee", requireAuth, async (req, res) => {
    const taskId = parseInt(req.params.taskId);
    const { assigneeId } = req.body;
    const task = await storage.updateTask(taskId, { assigneeId });
    res.json(task);
  });

  // User routes
  app.get("/api/users", requireAuth, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.post("/api/users", requireAuth, async (req, res) => {
    const userData = insertUserSchema.parse(req.body);
    const user = await storage.createUser(userData);
    res.status(201).json(user);
  });

  app.put("/api/users/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await storage.updateUser(id, req.body);
    res.json(user);
  });

  app.delete("/api/users/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteUser(id);
    res.sendStatus(204);
  });

  // Department routes
  app.get("/api/departments", requireAuth, async (req, res) => {
    const departments = await storage.getDepartments();
    res.json(departments);
  });

  app.get("/api/departments/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const department = await storage.getDepartment(id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.json(department);
  });

  app.post("/api/departments", requireAuth, async (req, res) => {
    const departmentData = insertDepartmentSchema.parse(req.body);
    const department = await storage.createDepartment(departmentData);
    res.status(201).json(department);
  });

  app.put("/api/departments/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const department = await storage.updateDepartment(id, req.body);
    res.json(department);
  });

  app.delete("/api/departments/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteDepartment(id);
    res.sendStatus(204);
  });

  // Profile routes
  app.get("/api/profiles", requireAuth, async (req, res) => {
    const profiles = await storage.getProfiles();
    res.json(profiles);
  });

  app.get("/api/profiles/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const profile = await storage.getProfile(id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  });

  app.post("/api/profiles", requireAuth, async (req, res) => {
    const profileData = insertProfileSchema.parse(req.body);
    const profile = await storage.createProfile(profileData);
    res.status(201).json(profile);
  });

  app.put("/api/profiles/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const profile = await storage.updateProfile(id, req.body);
    res.json(profile);
  });

  app.delete("/api/profiles/:id", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteProfile(id);
    res.sendStatus(204);
  });

  const httpServer = createServer(app);
  return httpServer;
}
