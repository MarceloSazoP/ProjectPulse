import { db } from '../db';
import type { TeamInput, TeamMemberInput } from '../schemas/teamSchema';

// Tipos de retorno estandarizados
type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export const getTeams = async (): Promise<ServiceResponse<any[]>> => {
  try {
    const teams = await db.query('SELECT * FROM teams ORDER BY name ASC');
    return { success: true, data: teams };
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    return { success: false, error: 'Error al obtener equipos' };
  }
};

export const getTeamById = async (id: number): Promise<ServiceResponse<any>> => {
  try {
    const [team] = await db.query('SELECT * FROM teams WHERE id = $1', [id]);
    
    if (!team) {
      return { success: false, error: 'Equipo no encontrado' };
    }
    
    return { success: true, data: team };
  } catch (error) {
    console.error('Error al obtener equipo:', error);
    return { success: false, error: 'Error al obtener equipo' };
  }
};

export const createTeam = async (teamData: TeamInput): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si ya existe un equipo con ese nombre
    const [existingTeam] = await db.query(
      'SELECT * FROM teams WHERE name = $1',
      [teamData.name]
    );
    
    if (existingTeam) {
      return { success: false, error: 'Ya existe un equipo con ese nombre' };
    }
    
    const [newTeam] = await db.query(
      'INSERT INTO teams (name, description) VALUES ($1, $2) RETURNING *',
      [teamData.name, teamData.description]
    );
    
    return { success: true, data: newTeam };
  } catch (error) {
    console.error('Error al crear equipo:', error);
    return { success: false, error: 'Error al crear equipo' };
  }
};

export const updateTeam = async (id: number, teamData: Partial<TeamInput>): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si el equipo existe
    const [team] = await db.query('SELECT * FROM teams WHERE id = $1', [id]);
    
    if (!team) {
      return { success: false, error: 'Equipo no encontrado' };
    }
    
    // Verificar si el nuevo nombre ya existe (si se está actualizando el nombre)
    if (teamData.name && teamData.name !== team.name) {
      const [existingTeam] = await db.query(
        'SELECT * FROM teams WHERE name = $1 AND id != $2',
        [teamData.name, id]
      );
      
      if (existingTeam) {
        return { success: false, error: 'Ya existe un equipo con ese nombre' };
      }
    }
    
    const [updatedTeam] = await db.query(
      'UPDATE teams SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [
        teamData.name || team.name,
        teamData.description !== undefined ? teamData.description : team.description,
        id
      ]
    );
    
    return { success: true, data: updatedTeam };
  } catch (error) {
    console.error('Error al actualizar equipo:', error);
    return { success: false, error: 'Error al actualizar equipo' };
  }
};

export const deleteTeam = async (id: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si el equipo existe
    const [team] = await db.query('SELECT * FROM teams WHERE id = $1', [id]);
    
    if (!team) {
      return { success: false, error: 'Equipo no encontrado' };
    }
    
    // Eliminar primero los miembros del equipo
    await db.query('DELETE FROM team_members WHERE team_id = $1', [id]);
    
    // Luego eliminar el equipo
    await db.query('DELETE FROM teams WHERE id = $1', [id]);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar equipo:', error);
    return { success: false, error: 'Error al eliminar equipo' };
  }
};

export const getTeamMembers = async (teamId: number): Promise<ServiceResponse<any[]>> => {
  try {
    const members = await db.query(
      `SELECT u.* FROM users u
       JOIN team_members tm ON u.id = tm.user_id
       WHERE tm.team_id = $1
       ORDER BY u.name ASC`,
      [teamId]
    );
    
    return { success: true, data: members };
  } catch (error) {
    console.error('Error al obtener miembros del equipo:', error);
    return { success: false, error: 'Error al obtener miembros del equipo' };
  }
};

export const addTeamMember = async (teamMemberData: TeamMemberInput): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si el equipo existe
    const [team] = await db.query('SELECT * FROM teams WHERE id = $1', [teamMemberData.team_id]);
    
    if (!team) {
      return { success: false, error: 'Equipo no encontrado' };
    }
    
    // Verificar si el usuario existe
    const [user] = await db.query('SELECT * FROM users WHERE id = $1', [teamMemberData.user_id]);
    
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    // Verificar si ya existe esta relación
    const [existingMember] = await db.query(
      'SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamMemberData.team_id, teamMemberData.user_id]
    );
    
    if (existingMember) {
      return { success: false, error: 'El usuario ya pertenece a este equipo' };
    }
    
    const [newMember] = await db.query(
      'INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) RETURNING *',
      [teamMemberData.team_id, teamMemberData.user_id]
    );
    
    return { success: true, data: newMember };
  } catch (error) {
    console.error('Error al añadir miembro al equipo:', error);
    return { success: false, error: 'Error al añadir miembro al equipo' };
  }
};

export const removeTeamMember = async (teamId: number, userId: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si existe esta relación
    const [member] = await db.query(
      'SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    );
    
    if (!member) {
      return { success: false, error: 'El usuario no pertenece a este equipo' };
    }
    
    await db.query(
      'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar miembro del equipo:', error);
    return { success: false, error: 'Error al eliminar miembro del equipo' };
  }
};

export const getUserTeams = async (userId: number): Promise<ServiceResponse<any[]>> => {
  try {
    const teams = await db.query(
      `SELECT t.* FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = $1
       ORDER BY t.name ASC`,
      [userId]
    );
    
    return { success: true, data: teams };
  } catch (error) {
    console.error('Error al obtener equipos del usuario:', error);
    return { success: false, error: 'Error al obtener equipos del usuario' };
  }
};