
import { Request, Response } from 'express';
import * as projectService from '../services/projectService';
import { projectSchema } from '../schemas/projectSchema';
import * as logService from '../services/logService';

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const result = await projectService.getAllProjects();
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getAllProjects controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await projectService.getProjectById(id);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getProjectById controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const projectData = projectSchema.parse(req.body);
    
    // Asignar el usuario actual como manager si no se especifica
    if (!projectData.manager_id && req.user) {
      projectData.manager_id = req.user.id;
    }
    
    const result = await projectService.createProject(projectData);
    
    if (result.success) {
      await logService.createLog({
        action: 'create_project',
        entity: 'projects',
        entity_id: result.data.id,
        details: `Proyecto creado: ${projectData.name}`,
        user_id: req.user?.id
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in createProject controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const projectData = req.body;
    
    const result = await projectService.updateProject(id, projectData);
    
    if (result.success) {
      await logService.createLog({
        action: 'update_project',
        entity: 'projects',
        entity_id: id,
        details: `Proyecto actualizado: ID ${id}`,
        user_id: req.user?.id
      });
      
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in updateProject controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await projectService.deleteProject(id);
    
    if (result.success) {
      await logService.createLog({
        action: 'delete_project',
        entity: 'projects',
        entity_id: id,
        details: `Proyecto eliminado: ID ${id}`,
        user_id: req.user?.id
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in deleteProject controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getProjectsByDepartment = async (req: Request, res: Response) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    const result = await projectService.getProjectsByDepartment(departmentId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getProjectsByDepartment controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getProjectsForUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = await projectService.getProjectsForUser(userId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getProjectsForUser controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getProjectTeams = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const result = await projectService.getProjectTeams(projectId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getProjectTeams controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const assignTeamToProject = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.body.project_id);
    const teamId = parseInt(req.body.team_id);
    
    const result = await projectService.assignTeamToProject(projectId, teamId);
    
    if (result.success) {
      await logService.createLog({
        action: 'assign_team',
        entity: 'projects_teams',
        entity_id: projectId,
        details: `Equipo ID ${teamId} asignado al proyecto ID ${projectId}`,
        user_id: req.user?.id
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in assignTeamToProject controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const removeTeamFromProject = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const teamId = parseInt(req.params.teamId);
    
    const result = await projectService.removeTeamFromProject(projectId, teamId);
    
    if (result.success) {
      await logService.createLog({
        action: 'remove_team',
        entity: 'projects_teams',
        entity_id: projectId,
        details: `Equipo ID ${teamId} removido del proyecto ID ${projectId}`,
        user_id: req.user?.id
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in removeTeamFromProject controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
