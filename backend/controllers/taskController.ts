
import { Request, Response } from 'express';
import * as taskService from '../services/taskService';

// Obtener todas las tareas
export async function getAllTasks(req: Request, res: Response) {
  try {
    const tasks = await taskService.getAllTasks();
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ message: 'Error al obtener tareas' });
  }
}

// Obtener tareas por proyecto
export async function getTasksByProject(req: Request, res: Response) {
  try {
    const projectId = parseInt(req.params.projectId);
    const tasks = await taskService.getTasksByProject(projectId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error al obtener tareas del proyecto:', error);
    res.status(500).json({ message: 'Error al obtener tareas del proyecto' });
  }
}

// Obtener una tarea por ID
export async function getTaskById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const task = await taskService.getTaskById(id);
    
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    res.status(200).json(task);
  } catch (error) {
    console.error('Error al obtener la tarea:', error);
    res.status(500).json({ message: 'Error al obtener la tarea' });
  }
}

// Crear una nueva tarea
export async function createTask(req: Request, res: Response) {
  try {
    const taskData = req.body;
    const newTask = await taskService.createTask(taskData);
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error al crear la tarea:', error);
    res.status(500).json({ message: 'Error al crear la tarea' });
  }
}

// Actualizar una tarea
export async function updateTask(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const taskData = req.body;
    const updatedTask = await taskService.updateTask(id, taskData);
    
    if (!updatedTask) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error al actualizar la tarea:', error);
    res.status(500).json({ message: 'Error al actualizar la tarea' });
  }
}

// Eliminar una tarea
export async function deleteTask(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const success = await taskService.deleteTask(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar la tarea:', error);
    res.status(500).json({ message: 'Error al eliminar la tarea' });
  }
}
