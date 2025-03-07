
import { Request, Response } from 'express';
import * as taskService from '../services/taskService';
import { ganttTaskSchema, ganttTaskDependencySchema } from '../schemas/taskSchema';
import * as logService from '../services/logService';

// Tareas Gantt
export const getGanttTasks = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const result = await taskService.getGanttTasks(projectId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getGanttTasks controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getGanttTaskById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await taskService.getGanttTaskById(id);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getGanttTaskById controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createGanttTask = async (req: Request, res: Response) => {
  try {
    const taskData = ganttTaskSchema.parse(req.body);
    const result = await taskService.createGanttTask(taskData);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'create_gantt_task',
        description: `Tarea Gantt creada: ${taskData.name}`,
        ip_address: req.ip
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in createGanttTask controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const updateGanttTask = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const taskData = req.body;
    
    const result = await taskService.updateGanttTask(id, taskData);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'update_gantt_task',
        description: `Tarea Gantt actualizada: ID ${id}`,
        ip_address: req.ip
      });
      
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in updateGanttTask controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteGanttTask = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await taskService.deleteGanttTask(id);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'delete_gantt_task',
        description: `Tarea Gantt eliminada: ID ${id}`,
        ip_address: req.ip
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in deleteGanttTask controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Dependencias entre tareas
export const getTaskDependencies = async (req: Request, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const result = await taskService.getTaskDependencies(taskId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getTaskDependencies controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const addTaskDependency = async (req: Request, res: Response) => {
  try {
    const dependencyData = ganttTaskDependencySchema.parse(req.body);
    const result = await taskService.addTaskDependency(dependencyData);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'add_task_dependency',
        description: `Dependencia añadida: Tarea ${dependencyData.task_id} depende de ${dependencyData.depends_on_task_id}`,
        ip_address: req.ip
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in addTaskDependency controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const removeTaskDependency = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await taskService.removeTaskDependency(id);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'remove_task_dependency',
        description: `Dependencia eliminada: ID ${id}`,
        ip_address: req.ip
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in removeTaskDependency controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
