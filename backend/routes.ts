
import express from 'express';
import * as projectController from './controllers/projectController';
import * as taskController from './controllers/taskController';
// Aquí se importarán más controladores a medida que se implementen

const router = express.Router();

// Rutas de proyectos
router.get('/projects', projectController.getAllProjects);
router.get('/projects/:id', projectController.getProjectById);
router.post('/projects', projectController.createProject);
router.put('/projects/:id', projectController.updateProject);
router.delete('/projects/:id', projectController.deleteProject);
router.get('/projects/:projectId/teams', projectController.getProjectTeams);
router.post('/projects/team-assignment', projectController.assignTeamToProject);

// Rutas de tareas
router.get('/tasks', taskController.getAllTasks);
router.get('/tasks/:id', taskController.getTaskById);
router.get('/projects/:projectId/tasks', taskController.getTasksByProject);
router.post('/tasks', taskController.createTask);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);
router.post('/tasks/:taskId/assign', taskController.assignTaskToUser);

// Aquí se agregarán más rutas a medida que se implementen los controladores
// Por ejemplo:
// Rutas de usuarios
// router.get('/users', userController.getAllUsers);
// router.get('/users/:id', userController.getUserById);
// router.post('/users', userController.createUser);
// router.put('/users/:id', userController.updateUser);
// router.delete('/users/:id', userController.deleteUser);

// Rutas de equipos
// router.get('/teams', teamController.getAllTeams);
// router.get('/teams/:id', teamController.getTeamById);
// router.post('/teams', teamController.createTeam);
// router.put('/teams/:id', teamController.updateTeam);
// router.delete('/teams/:id', teamController.deleteTeam);
// router.get('/teams/:teamId/members', teamController.getTeamMembers);
// router.post('/teams/:teamId/members', teamController.addTeamMember);
// router.delete('/teams/:teamId/members/:userId', teamController.removeTeamMember);

// Rutas de tableros Kanban
// router.get('/kanban/boards', kanbanController.getAllBoards);
// router.get('/kanban/boards/:id', kanbanController.getBoardById);
// router.get('/projects/:projectId/kanban', kanbanController.getBoardsByProject);
// router.post('/kanban/boards', kanbanController.createBoard);
// router.put('/kanban/boards/:id', kanbanController.updateBoard);
// router.delete('/kanban/boards/:id', kanbanController.deleteBoard);

// Rutas de columnas Kanban
// router.get('/kanban/boards/:boardId/columns', kanbanController.getColumnsByBoard);
// router.post('/kanban/columns', kanbanController.createColumn);
// router.put('/kanban/columns/:id', kanbanController.updateColumn);
// router.delete('/kanban/columns/:id', kanbanController.deleteColumn);

// Rutas de tarjetas Kanban
// router.get('/kanban/columns/:columnId/cards', kanbanController.getCardsByColumn);
// router.post('/kanban/cards', kanbanController.createCard);
// router.put('/kanban/cards/:id', kanbanController.updateCard);
// router.delete('/kanban/cards/:id', kanbanController.deleteCard);
// router.post('/kanban/cards/:cardId/assign', kanbanController.assignCardToUser);

// Rutas de tareas Gantt
// router.get('/gantt/tasks', ganttController.getAllTasks);
// router.get('/projects/:projectId/gantt', ganttController.getTasksByProject);
// router.post('/gantt/tasks', ganttController.createTask);
// router.put('/gantt/tasks/:id', ganttController.updateTask);
// router.delete('/gantt/tasks/:id', ganttController.deleteTask);
// router.post('/gantt/tasks/:taskId/assign', ganttController.assignTaskToUser);
// router.post('/gantt/tasks/dependencies', ganttController.addTaskDependency);
// router.delete('/gantt/tasks/dependencies/:id', ganttController.removeTaskDependency);

export default router;
