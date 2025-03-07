
import { Request, Response } from 'express';
import * as teamService from '../services/teamService';
import { teamSchema, teamMemberSchema, teamProjectSchema } from '../schemas/teamSchema';
import * as logService from '../services/logService';

// Equipos
export const getTeams = async (req: Request, res: Response) => {
  try {
    const result = await teamService.getTeams();
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getTeams controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getTeamById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await teamService.getTeamById(id);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getTeamById controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createTeam = async (req: Request, res: Response) => {
  try {
    const teamData = teamSchema.parse(req.body);
    const result = await teamService.createTeam(teamData);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'create_team',
        description: `Equipo creado: ${teamData.name}`,
        ip_address: req.ip
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in createTeam controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const teamData = req.body;
    
    const result = await teamService.updateTeam(id, teamData);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'update_team',
        description: `Equipo actualizado: ID ${id}`,
        ip_address: req.ip
      });
      
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in updateTeam controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await teamService.deleteTeam(id);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'delete_team',
        description: `Equipo eliminado: ID ${id}`,
        ip_address: req.ip
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in deleteTeam controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Miembros del equipo
export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.teamId);
    const result = await teamService.getTeamMembers(teamId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getTeamMembers controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const addTeamMember = async (req: Request, res: Response) => {
  try {
    const teamMemberData = teamMemberSchema.parse(req.body);
    const result = await teamService.addTeamMember(teamMemberData);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'add_team_member',
        description: `Miembro ${teamMemberData.user_id} añadido al equipo ${teamMemberData.team_id}`,
        ip_address: req.ip
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in addTeamMember controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const updateTeamMember = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const teamMemberData = req.body;
    
    const result = await teamService.updateTeamMember(id, teamMemberData);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'update_team_member',
        description: `Miembro de equipo actualizado: ID ${id}`,
        ip_address: req.ip
      });
      
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in updateTeamMember controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const removeTeamMember = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await teamService.removeTeamMember(id);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'remove_team_member',
        description: `Miembro removido del equipo: ID ${id}`,
        ip_address: req.ip
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in removeTeamMember controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Proyectos del equipo
export const getTeamProjects = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.teamId);
    const result = await teamService.getTeamProjects(teamId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getTeamProjects controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const assignProjectToTeam = async (req: Request, res: Response) => {
  try {
    const teamProjectData = teamProjectSchema.parse(req.body);
    const result = await teamService.assignProjectToTeam(teamProjectData);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'assign_project_to_team',
        description: `Proyecto ${teamProjectData.project_id} asignado al equipo ${teamProjectData.team_id}`,
        ip_address: req.ip
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in assignProjectToTeam controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const removeProjectFromTeam = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.teamId);
    const projectId = parseInt(req.params.projectId);
    
    const result = await teamService.removeProjectFromTeam(teamId, projectId);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'remove_project_from_team',
        description: `Proyecto ${projectId} removido del equipo ${teamId}`,
        ip_address: req.ip
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in removeProjectFromTeam controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
