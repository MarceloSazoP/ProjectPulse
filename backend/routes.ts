
import express, { Router } from 'express';
import * as projectController from './controllers/projectController';
import * as taskController from './controllers/taskController';

const router: Router = express.Router();

// Rutas de proyectos
router.get('/projects', projectController.getAllProjects);
router.get('/projects/:id', projectController.getProjectById);
router.post('/projects', projectController.createProject);
router.put('/projects/:id', projectController.updateProject);
router.delete('/projects/:id', projectController.deleteProject);

// Rutas de tareas
router.get('/tasks', taskController.getAllTasks);
router.get('/projects/:projectId/tasks', taskController.getTasksByProject);
router.get('/tasks/:id', taskController.getTaskById);
router.post('/tasks', taskController.createTask);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);

export default router;
