import { db } from '../db';
import type { RoleInput, UserRoleInput } from '../schemas/roleSchema';

// Tipos de retorno estandarizados
type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export const getRoles = async (): Promise<ServiceResponse<any[]>> => {
  try {
    const roles = await db.query('SELECT * FROM roles ORDER BY name ASC');
    return { success: true, data: roles };
  } catch (error) {
    console.error('Error al obtener roles:', error);
    return { success: false, error: 'Error al obtener roles' };
  }
};

export const getRoleById = async (id: number): Promise<ServiceResponse<any>> => {
  try {
    const [role] = await db.query('SELECT * FROM roles WHERE id = $1', [id]);
    
    if (!role) {
      return { success: false, error: 'Rol no encontrado' };
    }
    
    return { success: true, data: role };
  } catch (error) {
    console.error('Error al obtener rol:', error);
    return { success: false, error: 'Error al obtener rol' };
  }
};

export const createRole = async (roleData: RoleInput): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si ya existe un rol con ese nombre
    const [existingRole] = await db.query(
      'SELECT * FROM roles WHERE name = $1',
      [roleData.name]
    );
    
    if (existingRole) {
      return { success: false, error: 'Ya existe un rol con ese nombre' };
    }
    
    const [newRole] = await db.query(
      'INSERT INTO roles (name) VALUES ($1) RETURNING *',
      [roleData.name]
    );
    
    return { success: true, data: newRole };
  } catch (error) {
    console.error('Error al crear rol:', error);
    return { success: false, error: 'Error al crear rol' };
  }
};

export const updateRole = async (id: number, roleData: Partial<RoleInput>): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si el rol existe
    const [role] = await db.query('SELECT * FROM roles WHERE id = $1', [id]);
    
    if (!role) {
      return { success: false, error: 'Rol no encontrado' };
    }
    
    // Verificar si el nuevo nombre ya existe (si se está actualizando el nombre)
    if (roleData.name && roleData.name !== role.name) {
      const [existingRole] = await db.query(
        'SELECT * FROM roles WHERE name = $1 AND id != $2',
        [roleData.name, id]
      );
      
      if (existingRole) {
        return { success: false, error: 'Ya existe un rol con ese nombre' };
      }
    }
    
    const [updatedRole] = await db.query(
      'UPDATE roles SET name = $1 WHERE id = $2 RETURNING *',
      [
        roleData.name || role.name,
        id
      ]
    );
    
    return { success: true, data: updatedRole };
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    return { success: false, error: 'Error al actualizar rol' };
  }
};

export const deleteRole = async (id: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si el rol existe
    const [role] = await db.query('SELECT * FROM roles WHERE id = $1', [id]);
    
    if (!role) {
      return { success: false, error: 'Rol no encontrado' };
    }
    
    // Verificar si hay usuarios con este rol
    const [userRoleCount] = await db.query(
      'SELECT COUNT(*) as count FROM user_roles WHERE role_id = $1',
      [id]
    );
    
    if (userRoleCount.count > 0) {
      return { 
        success: false, 
        error: 'No se puede eliminar el rol porque hay usuarios asignados a él' 
      };
    }
    
    // Verificar si hay permisos asociados a este rol
    const [rolePermissionCount] = await db.query(
      'SELECT COUNT(*) as count FROM role_permissions WHERE role_id = $1',
      [id]
    );
    
    if (rolePermissionCount.count > 0) {
      // Eliminar los permisos asociados al rol
      await db.query('DELETE FROM role_permissions WHERE role_id = $1', [id]);
    }
    
    await db.query('DELETE FROM roles WHERE id = $1', [id]);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    return { success: false, error: 'Error al eliminar rol' };
  }
};

export const assignRoleToUser = async (userRoleData: UserRoleInput): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si el usuario existe
    const [user] = await db.query('SELECT * FROM users WHERE id = $1', [userRoleData.user_id]);
    
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    // Verificar si el rol existe
    const [role] = await db.query('SELECT * FROM roles WHERE id = $1', [userRoleData.role_id]);
    
    if (!role) {
      return { success: false, error: 'Rol no encontrado' };
    }
    
    // Verificar si ya existe esta asignación
    const [existingUserRole] = await db.query(
      'SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [userRoleData.user_id, userRoleData.role_id]
    );
    
    if (existingUserRole) {
      return { success: false, error: 'El usuario ya tiene asignado este rol' };
    }
    
    const [newUserRole] = await db.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) RETURNING *',
      [userRoleData.user_id, userRoleData.role_id]
    );
    
    return { success: true, data: newUserRole };
  } catch (error) {
    console.error('Error al asignar rol a usuario:', error);
    return { success: false, error: 'Error al asignar rol a usuario' };
  }
};

export const removeRoleFromUser = async (userId: number, roleId: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si existe esta asignación
    const [userRole] = await db.query(
      'SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [userId, roleId]
    );
    
    if (!userRole) {
      return { success: false, error: 'El usuario no tiene asignado este rol' };
    }
    
    await db.query(
      'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [userId, roleId]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar rol de usuario:', error);
    return { success: false, error: 'Error al eliminar rol de usuario' };
  }
};

export const getUserRoles = async (userId: number): Promise<ServiceResponse<any[]>> => {
  try {
    const roles = await db.query(
      `SELECT r.* FROM roles r
       JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1
       ORDER BY r.name ASC`,
      [userId]
    );
    
    return { success: true, data: roles };
  } catch (error) {
    console.error('Error al obtener roles del usuario:', error);
    return { success: false, error: 'Error al obtener roles del usuario' };
  }
};