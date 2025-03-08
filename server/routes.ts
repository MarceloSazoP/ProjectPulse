
/**
 * API ROUTES CONFIGURATION
 * 
 * Este archivo define todas las rutas de la API del backend.
 */

import express from 'express';
import { storage } from './storage'; // Importamos storage en lugar de db
import { InsertProject, InsertTask, insertProjectSchema, insertTaskSchema, projects, tasks, users } from '../shared/schema';
import { and, eq } from 'drizzle-orm';
import * as auth from './auth'; // Importamos todas las funciones de autenticación

// Middleware de autenticación - Verifica que el usuario esté autenticado
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Crear router de Express
const router = express.Router();

// Rutas públicas
router.post('/login', (req, res) => {
  // Implementación temporal del login
  console.log('Intentando login con:', req.body);
  res.status(200).json({ message: 'Login route available' });
});

router.post('/register', (req, res) => {
  // Implementación temporal del registro
  console.log('Intentando registro con:', req.body);
  res.status(200).json({ message: 'Register route available' });
});

// Rutas protegidas
router.use(requireAuth);

// Usuario
router.get('/user', (req, res) => {
  res.json(req.user);
});

// Proyectos
router.get('/projects', async (req, res) => {
  try {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const allProjects = await storage.getProjects();
    const allProjects = await storage.getProjects();
    res.json(allProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Error fetching projects' });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const projectData = insertProjectSchema.parse(req.body);
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const newProject = await storage.createProject(projectData);
    const newProject = await storage.createProject(projectData);
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(400).json({ error: error.issues || 'Error creating project' });
  }
});

router.get('/projects/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const project = await storage.getProject(projectId);
    const project = await storage.getProject(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Error fetching project' });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const existingProject = await storage.getProject(projectId);
    const existingProject = await storage.getProject(projectId);

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const updatedProject = await storage.updateProject(projectId, req.body);
    const updatedProject = await storage.updateProject(projectId, req.body);
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(400).json({ error: error.issues || 'Error updating project' });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const existingProject = await storage.getProject(projectId);
    const existingProject = await storage.getProject(projectId);

    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // await storage.deleteProject(projectId);
    await storage.deleteProject(projectId);
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Error deleting project' });
  }
});

router.get('/projects/:projectId/teams', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const teams = await storage.getProjectTeams(projectId);
    const teams = await storage.getProjectTeams(projectId);
    res.json(teams);
  } catch (error) {
    console.error('Error fetching project teams:', error);
    res.status(500).json({ error: 'Error fetching project teams' });
  }
});

router.post('/projects/team-assignment', async (req, res) => {
  try {
    const { projectId, teamId } = req.body;
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const assignment = await storage.assignTeamToProject(projectId, teamId);
    const assignment = await storage.assignTeamToProject(projectId, teamId);
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error assigning team to project:', error);
    res.status(400).json({ error: 'Error assigning team to project' });
  }
});

// Tareas
router.get('/tasks', async (req, res) => {
  try {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const allTasks = await storage.getAllTasks();
    const allTasks = await storage.getAllTasks();
    res.json(allTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

router.get('/tasks/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const task = await storage.getTask(taskId);
    const task = await storage.getTask(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Error fetching task' });
  }
});

router.get('/projects/:projectId/tasks', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const projectTasks = await storage.getTasks(projectId);
    const projectTasks = await storage.getTasks(projectId);

    // Obtener información de los usuarios asignados
    const tasksWithAssignees = await Promise.all(projectTasks.map(async (task) => {
      if (task.assigneeId) {
        // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
        // const assignee = await storage.getUser(task.assigneeId);
        const assignee = await storage.getUser(task.assigneeId);

        if (assignee) {
          return {
            ...task,
            assigneeName: assignee.username
          };
        }
      }
      return task;
    }));

    res.json(tasksWithAssignees);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const taskData = insertTaskSchema.parse(req.body);
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const newTask = await storage.createTask(taskData);
    const newTask = await storage.createTask(taskData);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ error: error.issues || 'Error creating task' });
  }
});

router.post('/projects/:id/tasks', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    // Verificar que el proyecto existe
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const project = await storage.getProject(projectId);
    const project = await storage.getProject(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Crear la tarea
    const taskData = insertTaskSchema.parse({
      ...req.body,
      projectId
    });

    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const newTask = await storage.createTask(taskData);
    const newTask = await storage.createTask(taskData);

    // Si hay un asignado, obtener su información
    if (newTask.assigneeId) {
      // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
      // const assignee = await storage.getUser(newTask.assigneeId);
      const assignee = await storage.getUser(newTask.assigneeId);

      if (assignee) {
        return res.json({
          ...newTask,
          assigneeName: assignee.username
        });
      }
    }

    res.json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ error: error.issues || 'Error creating task' });
  }
});

router.put('/tasks/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    // Verificar que la tarea existe
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const existingTask = await storage.getTask(taskId);
    const existingTask = await storage.getTask(taskId);

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Actualizar la tarea
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const updatedTask = await storage.updateTask(taskId, req.body);
    const updatedTask = await storage.updateTask(taskId, req.body);

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ error: error.issues || 'Error updating task' });
  }
});

router.delete('/tasks/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    
    // Verificar que la tarea existe
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const existingTask = await storage.getTask(taskId);
    const existingTask = await storage.getTask(taskId);

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Eliminar la tarea
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // await storage.deleteTask(taskId);
    await storage.deleteTask(taskId);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Error deleting task' });
  }
});

router.post('/tasks/:taskId/assign', async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const { userId } = req.body;
    
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const assignment = await storage.assignTaskToUser(taskId, userId);
    const assignment = await storage.assignTaskToUser(taskId, userId);
    
    res.status(200).json(assignment);
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(400).json({ error: 'Error assigning task to user' });
  }
});

// Usuarios
router.get('/users', async (req, res) => {
  try {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const allUsers = await storage.getUsers();
    const allUsers = await storage.getUsers();
    
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

export default router;
