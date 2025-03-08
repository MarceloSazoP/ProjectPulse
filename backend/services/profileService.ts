
import { db } from '../db';
import type { ProfileInput } from '../schemas/profileSchema';

// Tipos de retorno estandarizados
type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export const getProfileByUserId = async (userId: number): Promise<ServiceResponse<any>> => {
  try {
    // Obtener el perfil básico
    const [profile] = await db.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    
    if (!profile) {
      return { success: false, error: 'Perfil no encontrado' };
    }
    
    // Obtener información adicional del usuario
    const [user] = await db.query(
      'SELECT id, name, email, profile_picture, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    // Obtener los departamentos a los que pertenece
    const departments = await db.query(
      `SELECT d.* FROM departments d
       JOIN user_departments ud ON d.id = ud.department_id
       WHERE ud.user_id = $1`,
      [userId]
    );
    
    // Obtener los equipos a los que pertenece
    const teams = await db.query(
      `SELECT t.* FROM teams t
       JOIN team_members tm ON t.id = tm.team_id
       WHERE tm.user_id = $1`,
      [userId]
    );
    
    // Obtener roles
    const roles = await db.query(
      `SELECT r.* FROM roles r
       JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId]
    );
    
    // Combinar la información
    const fullProfile = {
      ...profile,
      user,
      departments,
      teams,
      roles
    };
    
    return { success: true, data: fullProfile };
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return { success: false, error: 'Error al obtener perfil' };
  }
};

export const createProfile = async (profileData: ProfileInput): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si ya existe un perfil para este usuario
    const [existingProfile] = await db.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [profileData.user_id]
    );
    
    if (existingProfile) {
      return { success: false, error: 'Este usuario ya tiene un perfil' };
    }
    
    // Verificar si el usuario existe
    const [user] = await db.query('SELECT * FROM users WHERE id = $1', [profileData.user_id]);
    
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    const [newProfile] = await db.query(
      'INSERT INTO profiles (user_id, bio, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [profileData.user_id, profileData.bio, profileData.phone, profileData.address]
    );
    
    return { success: true, data: newProfile };
  } catch (error) {
    console.error('Error al crear perfil:', error);
    return { success: false, error: 'Error al crear perfil' };
  }
};

export const updateProfile = async (userId: number, profileData: Partial<ProfileInput>): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si el perfil existe
    const [profile] = await db.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    
    if (!profile) {
      // Si no existe, crearlo
      const [newProfile] = await db.query(
        'INSERT INTO profiles (user_id, bio, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, profileData.bio, profileData.phone, profileData.address]
      );
      
      return { success: true, data: newProfile };
    }
    
    // Si ya existe, actualizarlo
    const [updatedProfile] = await db.query(
      `UPDATE profiles SET 
        bio = $1, 
        phone = $2, 
        address = $3
       WHERE user_id = $4 
       RETURNING *`,
      [
        profileData.bio !== undefined ? profileData.bio : profile.bio,
        profileData.phone !== undefined ? profileData.phone : profile.phone,
        profileData.address !== undefined ? profileData.address : profile.address,
        userId
      ]
    );
    
    return { success: true, data: updatedProfile };
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return { success: false, error: 'Error al actualizar perfil' };
  }
};

export const deleteProfile = async (userId: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si el perfil existe
    const [profile] = await db.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    
    if (!profile) {
      return { success: false, error: 'Perfil no encontrado' };
    }
    
    await db.query('DELETE FROM profiles WHERE user_id = $1', [userId]);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar perfil:', error);
    return { success: false, error: 'Error al eliminar perfil' };
  }
};

export const getUserActivity = async (userId: number): Promise<ServiceResponse<any[]>> => {
  try {
    // Obtener logs recientes de actividad
    const logs = await db.query(
      'SELECT * FROM logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 50', 
      [userId]
    );
    
    return { success: true, data: logs };
  } catch (error) {
    console.error('Error al obtener actividad del usuario:', error);
    return { success: false, error: 'Error al obtener actividad del usuario' };
  }
};

export const getUserTasks = async (userId: number): Promise<ServiceResponse<any[]>> => {
  try {
    // Obtener tareas asignadas al usuario
    const tasks = await db.query(
      'SELECT * FROM tasks WHERE assignee_id = $1 ORDER BY due_date ASC', 
      [userId]
    );
    
    return { success: true, data: tasks };
  } catch (error) {
    console.error('Error al obtener tareas del usuario:', error);
    return { success: false, error: 'Error al obtener tareas del usuario' };
  }
};

export const getUserProjects = async (userId: number): Promise<ServiceResponse<any[]>> => {
  try {
    // Obtener proyectos donde el usuario es el gestor
    const managedProjects = await db.query(
      'SELECT * FROM projects WHERE manager_id = $1', 
      [userId]
    );
    
    // Obtener proyectos donde el usuario está asignado a tareas
    const participatingProjects = await db.query(
      `SELECT DISTINCT p.* FROM projects p
       JOIN tasks t ON p.id = t.project_id
       WHERE t.assignee_id = $1 AND p.manager_id != $1`,
      [userId]
    );
    
    // Combinar ambos conjuntos
    const projectMap = new Map();
    
    managedProjects.forEach(project => {
      project.role = 'manager';
      projectMap.set(project.id, project);
    });
    
    participatingProjects.forEach(project => {
      if (!projectMap.has(project.id)) {
        project.role = 'member';
        projectMap.set(project.id, project);
      }
    });
    
    return { success: true, data: Array.from(projectMap.values()) };
  } catch (error) {
    console.error('Error al obtener proyectos del usuario:', error);
    return { success: false, error: 'Error al obtener proyectos del usuario' };
  }
};
