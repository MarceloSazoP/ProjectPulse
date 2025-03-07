
import { Request, Response } from 'express';
import * as taskService from '../services/taskService';

// Obtener todas las tareas
export async function getAllTasks(req: Request, res: Response) {
  try {
    const tasks = await taskService.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
}

// Obtener tareas por proyecto
export async function getTasksByProject(req: Request, res: Response) {
  try {
    const projectId = parseInt(req.params.projectId);
    const tasks = await taskService.getTasksByProject(projectId);
    res.json(tasks);
  } catch (error) {
    console.error('Error al obtener tareas del proyecto:', error);
    res.status(500).json({ error: 'Error al obtener tareas del proyecto' });
  }
}

// Obtener una tarea por ID
export async function getTaskById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const task = await taskService.getTaskById(id);
    
    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    res.status(500).json({ error: 'Error al obtener tarea' });
  }
}

// Crear una nueva tarea
export async function createTask(req: Request, res: Response) {
  try {
    const { name, description, status, priority, due_date, project_id, assignee_id } = req.body;
    
    // Validaciones básicas
    if (!name) {
      return res.status(400).json({ error: 'El nombre de la tarea es obligatorio' });
    }
    if (!project_id) {
      return res.status(400).json({ error: 'El ID del proyecto es obligatorio' });
    }
    if (!status) {
      return res.status(400).json({ error: 'El estado de la tarea es obligatorio' });
    }
    if (!priority) {
      return res.status(400).json({ error: 'La prioridad de la tarea es obligatoria' });
    }
    
    const newTask = await taskService.createTask({
      name,
      description,
      status,
      priority,
      due_date: due_date ? new Date(due_date) : undefined,
      project_id,
      assignee_id
    });
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({ error: 'Error al crear tarea' });
  }
}

// Actualizar una tarea existente
export async function updateTask(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { name, description, status, priority, due_date, project_id, assignee_id } = req.body;
    
    const updatedTask = await taskService.updateTask(id, {
      name,
      description,
      status,
      priority,
      due_date: due_date ? new Date(due_date) : undefined,
      project_id,
      assignee_id
    });
    
    if (!updatedTask) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
}

// Eliminar una tarea
export async function deleteTask(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const success = await taskService.deleteTask(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
}

// Asignar tarea a un usuario
export async function assignTaskToUser(req: Request, res: Response) {
  try {
    const taskId = parseInt(req.params.taskId);
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'El ID del usuario es obligatorio' });
    }
    
    const updatedTask = await taskService.assignTaskToUser(taskId, userId);
    
    if (!updatedTask) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    
    res.json(updatedTask);
  } catch (error) {
    console.error('Error al asignar tarea a usuario:', error);
    res.status(500).json({ error: 'Error al asignar tarea a usuario' });
  }
}
