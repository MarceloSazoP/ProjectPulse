
import { Request, Response } from 'express';
import * as taskService from '../services/taskService';
import { taskSchema } from '../schemas/taskSchema';
import * as logService from '../services/logService';

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const result = await taskService.getAllTasks();
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getAllTasks controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await taskService.getTaskById(id);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getTaskById controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getTasksByProject = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const result = await taskService.getTasksByProject(projectId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getTasksByProject controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getTasksByUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = await taskService.getTasksByUser(userId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getTasksByUser controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const taskData = taskSchema.parse(req.body);
    const result = await taskService.createTask(taskData);
    
    if (result.success) {
      await logService.createLog({
        action: 'create_task',
        entity: 'tasks',
        entity_id: result.data.id,
        details: `Tarea creada: ${taskData.name}`,
        user_id: req.user?.id
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in createTask controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const taskData = req.body;
    
    const result = await taskService.updateTask(id, taskData);
    
    if (result.success) {
      await logService.createLog({
        action: 'update_task',
        entity: 'tasks',
        entity_id: id,
        details: `Tarea actualizada: ID ${id}`,
        user_id: req.user?.id
      });
      
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in updateTask controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await taskService.deleteTask(id);
    
    if (result.success) {
      await logService.createLog({
        action: 'delete_task',
        entity: 'tasks',
        entity_id: id,
        details: `Tarea eliminada: ID ${id}`,
        user_id: req.user?.id
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in deleteTask controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const assignTaskToUser = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const userId = parseInt(req.body.user_id);
    
    const result = await taskService.assignTaskToUser(taskId, userId);
    
    if (result.success) {
      await logService.createLog({
        action: 'assign_task',
        entity: 'tasks',
        entity_id: taskId,
        details: `Tarea ID ${taskId} asignada al usuario ID ${userId}`,
        user_id: req.user?.id
      });
      
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in assignTaskToUser controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const unassignTask = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId);
    
    const result = await taskService.unassignTask(taskId);
    
    if (result.success) {
      await logService.createLog({
        action: 'unassign_task',
        entity: 'tasks',
        entity_id: taskId,
        details: `Tarea ID ${taskId} desasignada`,
        user_id: req.user?.id
      });
      
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in unassignTask controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
