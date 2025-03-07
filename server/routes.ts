import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProjectSchema, insertTaskSchema, insertTeamSchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
