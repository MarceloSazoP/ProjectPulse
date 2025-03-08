import { Request, Response } from 'express';
import * as teamService from '../services/teamService';
import { teamSchema, teamMemberSchema } from '../schemas/teamSchema';
import * as logService from '../services/logService';

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
      await logService.createLog({
        action: 'create_team',
        entity: 'teams',
        entity_id: result.data.id,
        details: `Equipo creado: ${teamData.name}`,
        user_id: req.user?.id
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
      await logService.createLog({
        action: 'update_team',
        entity: 'teams',
        entity_id: id,
        details: `Equipo actualizado: ID ${id}`,
        user_id: req.user?.id
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
      await logService.createLog({
        action: 'delete_team',
        entity: 'teams',
        entity_id: id,
        details: `Equipo eliminado: ID ${id}`,
        user_id: req.user?.id
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

export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.teamId);
    const result = await teamService.getTeamMembers(teamId);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getTeamMembers controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const addTeamMember = async (req: Request, res: Response) => {
  try {
    const memberData = teamMemberSchema.parse(req.body);
    const result = await teamService.addTeamMember(memberData);

    if (result.success) {
      await logService.createLog({
        action: 'add_team_member',
        entity: 'team_members',
        entity_id: memberData.team_id,
        details: `Usuario ID ${memberData.user_id} añadido al equipo ID ${memberData.team_id}`,
        user_id: req.user?.id
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

export const removeTeamMember = async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.teamId);
    const userId = parseInt(req.params.userId);

    const result = await teamService.removeTeamMember(teamId, userId);

    if (result.success) {
      await logService.createLog({
        action: 'remove_team_member',
        entity: 'team_members',
        entity_id: teamId,
        details: `Usuario ID ${userId} removido del equipo ID ${teamId}`,
        user_id: req.user?.id
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

export const getUserTeams = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = await teamService.getUserTeams(userId);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getUserTeams controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};