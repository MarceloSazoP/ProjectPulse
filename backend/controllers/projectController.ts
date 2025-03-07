
import { Request, Response } from 'express';
import * as projectService from '../services/projectService';

// Obtener todos los proyectos
export async function getAllProjects(req: Request, res: Response) {
  try {
    const projects = await projectService.getAllProjects();
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({ message: 'Error al obtener proyectos' });
  }
}

// Obtener un proyecto por ID
export async function getProjectById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const project = await projectService.getProjectById(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    
    res.status(200).json(project);
  } catch (error) {
    console.error('Error al obtener el proyecto:', error);
    res.status(500).json({ message: 'Error al obtener el proyecto' });
  }
}

// Crear un nuevo proyecto
export async function createProject(req: Request, res: Response) {
  try {
    const projectData = req.body;
    const newProject = await projectService.createProject(projectData);
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error al crear el proyecto:', error);
    res.status(500).json({ message: 'Error al crear el proyecto' });
  }
}

// Actualizar un proyecto
export async function updateProject(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const projectData = req.body;
    const updatedProject = await projectService.updateProject(id, projectData);
    
    if (!updatedProject) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error al actualizar el proyecto:', error);
    res.status(500).json({ message: 'Error al actualizar el proyecto' });
  }
}

// Eliminar un proyecto
export async function deleteProject(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const success = await projectService.deleteProject(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar el proyecto:', error);
    res.status(500).json({ message: 'Error al eliminar el proyecto' });
  }
}
