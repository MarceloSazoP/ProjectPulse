
import { Request, Response } from 'express';
import * as projectService from '../services/projectService';

// Obtener todos los proyectos
export async function getAllProjects(req: Request, res: Response) {
  try {
    const projects = await projectService.getAllProjects();
    res.json(projects);
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
}

// Obtener un proyecto por ID
export async function getProjectById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const project = await projectService.getProjectById(id);
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    res.status(500).json({ error: 'Error al obtener proyecto' });
  }
}

// Crear un nuevo proyecto
export async function createProject(req: Request, res: Response) {
  try {
    const { name, description, start_date, end_date, status, created_by } = req.body;
    
    // Validaciones básicas
    if (!name) {
      return res.status(400).json({ error: 'El nombre del proyecto es obligatorio' });
    }
    
    const newProject = await projectService.createProject({
      name,
      description,
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
      status,
      created_by
    });
    
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    res.status(500).json({ error: 'Error al crear proyecto' });
  }
}

// Actualizar un proyecto existente
export async function updateProject(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { name, description, start_date, end_date, status } = req.body;
    
    const updatedProject = await projectService.updateProject(id, {
      name,
      description,
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
      status
    });
    
    if (!updatedProject) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    res.status(500).json({ error: 'Error al actualizar proyecto' });
  }
}

// Eliminar un proyecto
export async function deleteProject(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const success = await projectService.deleteProject(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    res.status(500).json({ error: 'Error al eliminar proyecto' });
  }
}

// Asignar un equipo a un proyecto
export async function assignTeamToProject(req: Request, res: Response) {
  try {
    const { teamId, projectId } = req.body;
    
    if (!teamId || !projectId) {
      return res.status(400).json({ error: 'Se requiere el ID del equipo y del proyecto' });
    }
    
    const success = await projectService.assignTeamToProject(teamId, projectId);
    
    if (!success) {
      return res.status(400).json({ error: 'No se pudo asignar el equipo al proyecto' });
    }
    
    res.status(201).json({ message: 'Equipo asignado al proyecto exitosamente' });
  } catch (error) {
    console.error('Error al asignar equipo a proyecto:', error);
    res.status(500).json({ error: 'Error al asignar equipo a proyecto' });
  }
}

// Obtener los equipos de un proyecto
export async function getProjectTeams(req: Request, res: Response) {
  try {
    const projectId = parseInt(req.params.projectId);
    const teams = await projectService.getProjectTeams(projectId);
    res.json(teams);
  } catch (error) {
    console.error('Error al obtener equipos del proyecto:', error);
    res.status(500).json({ error: 'Error al obtener equipos del proyecto' });
  }
}
