import { db } from '../db';
import type { PermissionInput, RolePermissionInput } from '../schemas/permissionSchema';

// Tipos de retorno estandarizados
type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export const getPermissions = async (): Promise<ServiceResponse<any[]>> => {
  try {
    const permissions = await db.query('SELECT * FROM permissions ORDER BY name ASC');
    return { success: true, data: permissions };
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    return { success: false, error: 'Error al obtener permisos' };
  }
};

export const getPermissionById = async (id: number): Promise<ServiceResponse<any>> => {
  try {
    const [permission] = await db.query('SELECT * FROM permissions WHERE id = $1', [id]);
    
    if (!permission) {
      return { success: false, error: 'Permiso no encontrado' };
    }
    
    return { success: true, data: permission };
  } catch (error) {
    console.error('Error al obtener permiso:', error);
    return { success: false, error: 'Error al obtener permiso' };
  }
};

export const createPermission = async (permissionData: PermissionInput): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si ya existe un permiso con ese nombre
    const [existingPermission] = await db.query(
      'SELECT * FROM permissions WHERE name = $1',
      [permissionData.name]
    );
    
    if (existingPermission) {
      return { success: false, error: 'Ya existe un permiso con ese nombre' };
    }
    
    const [newPermission] = await db.query(
      'INSERT INTO permissions (name) VALUES ($1) RETURNING *',
      [permissionData.name]
    );
    
    return { success: true, data: newPermission };
  } catch (error) {
    console.error('Error al crear permiso:', error);
    return { success: false, error: 'Error al crear permiso' };
  }
};

export const updatePermission = async (id: number, permissionData: Partial<PermissionInput>): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si el permiso existe
    const [permission] = await db.query('SELECT * FROM permissions WHERE id = $1', [id]);
    
    if (!permission) {
      return { success: false, error: 'Permiso no encontrado' };
    }
    
    // Verificar si el nuevo nombre ya existe (si se está actualizando el nombre)
    if (permissionData.name && permissionData.name !== permission.name) {
      const [existingPermission] = await db.query(
        'SELECT * FROM permissions WHERE name = $1 AND id != $2',
        [permissionData.name, id]
      );
      
      if (existingPermission) {
        return { success: false, error: 'Ya existe un permiso con ese nombre' };
      }
    }
    
    const [updatedPermission] = await db.query(
      'UPDATE permissions SET name = $1 WHERE id = $2 RETURNING *',
      [
        permissionData.name || permission.name,
        id
      ]
    );
    
    return { success: true, data: updatedPermission };
  } catch (error) {
    console.error('Error al actualizar permiso:', error);
    return { success: false, error: 'Error al actualizar permiso' };
  }
};

export const deletePermission = async (id: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si el permiso existe
    const [permission] = await db.query('SELECT * FROM permissions WHERE id = $1', [id]);
    
    if (!permission) {
      return { success: false, error: 'Permiso no encontrado' };
    }
    
    // Verificar si hay roles con este permiso
    const [rolePermissionCount] = await db.query(
      'SELECT COUNT(*) as count FROM role_permissions WHERE permission_id = $1',
      [id]
    );
    
    if (rolePermissionCount.count > 0) {
      // Eliminar las asignaciones de este permiso a roles
      await db.query('DELETE FROM role_permissions WHERE permission_id = $1', [id]);
    }
    
    await db.query('DELETE FROM permissions WHERE id = $1', [id]);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar permiso:', error);
    return { success: false, error: 'Error al eliminar permiso' };
  }
};

export const assignPermissionToRole = async (rolePermissionData: RolePermissionInput): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si el rol existe
    const [role] = await db.query('SELECT * FROM roles WHERE id = $1', [rolePermissionData.role_id]);
    
    if (!role) {
      return { success: false, error: 'Rol no encontrado' };
    }
    
    // Verificar si el permiso existe
    const [permission] = await db.query('SELECT * FROM permissions WHERE id = $1', [rolePermissionData.permission_id]);
    
    if (!permission) {
      return { success: false, error: 'Permiso no encontrado' };
    }
    
    // Verificar si ya existe esta asignación
    const [existingRolePermission] = await db.query(
      'SELECT * FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
      [rolePermissionData.role_id, rolePermissionData.permission_id]
    );
    
    if (existingRolePermission) {
      return { success: false, error: 'El rol ya tiene asignado este permiso' };
    }
    
    const [newRolePermission] = await db.query(
      'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) RETURNING *',
      [rolePermissionData.role_id, rolePermissionData.permission_id]
    );
    
    return { success: true, data: newRolePermission };
  } catch (error) {
    console.error('Error al asignar permiso a rol:', error);
    return { success: false, error: 'Error al asignar permiso a rol' };
  }
};

export const removePermissionFromRole = async (roleId: number, permissionId: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si existe esta asignación
    const [rolePermission] = await db.query(
      'SELECT * FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
      [roleId, permissionId]
    );
    
    if (!rolePermission) {
      return { success: false, error: 'El rol no tiene asignado este permiso' };
    }
    
    await db.query(
      'DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
      [roleId, permissionId]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar permiso de rol:', error);
    return { success: false, error: 'Error al eliminar permiso de rol' };
  }
};

export const getRolePermissions = async (roleId: number): Promise<ServiceResponse<any[]>> => {
  try {
    const permissions = await db.query(
      `SELECT p.* FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = $1
       ORDER BY p.name ASC`,
      [roleId]
    );
    
    return { success: true, data: permissions };
  } catch (error) {
    console.error('Error al obtener permisos del rol:', error);
    return { success: false, error: 'Error al obtener permisos del rol' };
  }
};