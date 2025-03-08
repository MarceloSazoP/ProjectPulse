/**
 * API ROUTES CONFIGURATION
 * 
 * Este archivo define todas las rutas de la API del backend.
 * 
 * PRODUCCIÓN:
 * 1. Importar correctamente la configuración de la base de datos
 * 2. Asegurar que las rutas de autenticación estén correctamente configuradas
 * 3. Considerar agregar rate limiting para prevenir ataques DoS
 */

import express from 'express';
import { storage } from './storage'; // Importamos storage en lugar de db
import { InsertProject, InsertTask, insertProjectSchema, insertTaskSchema, projects, tasks, users } from '../shared/schema';
import { and, eq } from 'drizzle-orm';
import * as auth from './auth'; // Importamos todas las funciones de autenticación

// Middleware de autenticación - Verifica que el usuario esté autenticado
// PRODUCCIÓN: Este middleware debe validar correctamente los tokens JWT o sesiones
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
  // PRODUCCIÓN: Implementar autenticación adecuada
  console.log('Intentando login con:', req.body);
  res.status(200).json({ message: 'Login route available' });
});

router.post('/register', (req, res) => {
  // Implementación temporal del registro
  // PRODUCCIÓN: Implementar registro adecuado
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

// Tareas
router.get('/projects/:id/tasks', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const projectTasks = await storage.getTasks(projectId);

    // Obtener información de los usuarios asignados
    const tasksWithAssignees = await Promise.all(projectTasks.map(async (task) => {
      if (task.assigneeId) {
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

router.post('/projects/:id/tasks', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    // Verificar que el proyecto existe
    const project = await storage.getProject(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Crear la tarea
    const taskData = insertTaskSchema.parse({
      ...req.body,
      projectId
    });

    const newTask = await storage.createTask(taskData);

    // Si hay un asignado, obtener su información
    if (newTask.assigneeId) {
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
    const existingTask = await storage.getTask(taskId);

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Actualizar la tarea
    const updatedTask = await storage.updateTask(taskId, req.body);

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ error: error.issues || 'Error updating task' });
  }
});

// Usuarios
router.get('/users', async (req, res) => {
  try {
    const allUsers = await storage.getUsers();
    
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

export default router;