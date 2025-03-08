
import { Request, Response } from 'express';
import * as permissionService from '../services/permissionService';
import { permissionSchema, rolePermissionSchema } from '../schemas/permissionSchema';
import * as logService from '../services/logService';

export const getPermissions = async (req: Request, res: Response) => {
  try {
    const result = await permissionService.getPermissions();
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getPermissions controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getPermissionById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await permissionService.getPermissionById(id);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getPermissionById controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createPermission = async (req: Request, res: Response) => {
  try {
    const permissionData = permissionSchema.parse(req.body);
    const result = await permissionService.createPermission(permissionData);
    
    if (result.success) {
      await logService.createLog({
        action: 'create_permission',
        entity: 'permissions',
        entity_id: result.data.id,
        details: `Permiso creado: ${permissionData.name}`,
        user_id: req.user?.id
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in createPermission controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const updatePermission = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const permissionData = req.body;
    
    const result = await permissionService.updatePermission(id, permissionData);
    
    if (result.success) {
      await logService.createLog({
        action: 'update_permission',
        entity: 'permissions',
        entity_id: id,
        details: `Permiso actualizado: ID ${id}`,
        user_id: req.user?.id
      });
      
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in updatePermission controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deletePermission = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await permissionService.deletePermission(id);
    
    if (result.success) {
      await logService.createLog({
        action: 'delete_permission',
        entity: 'permissions',
        entity_id: id,
        details: `Permiso eliminado: ID ${id}`,
        user_id: req.user?.id
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in deletePermission controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const assignPermissionToRole = async (req: Request, res: Response) => {
  try {
    const assignmentData = rolePermissionSchema.parse(req.body);
    const result = await permissionService.assignPermissionToRole(assignmentData);
    
    if (result.success) {
      await logService.createLog({
        action: 'assign_permission',
        entity: 'roles_permissions',
        entity_id: assignmentData.role_id,
        details: `Permiso ID ${assignmentData.permission_id} asignado al rol ID ${assignmentData.role_id}`,
        user_id: req.user?.id
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in assignPermissionToRole controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const removePermissionFromRole = async (req: Request, res: Response) => {
  try {
    const roleId = parseInt(req.params.roleId);
    const permissionId = parseInt(req.params.permissionId);
    
    const result = await permissionService.removePermissionFromRole(roleId, permissionId);
    
    if (result.success) {
      await logService.createLog({
        action: 'remove_permission',
        entity: 'roles_permissions',
        entity_id: roleId,
        details: `Permiso ID ${permissionId} removido del rol ID ${roleId}`,
        user_id: req.user?.id
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in removePermissionFromRole controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const roleId = parseInt(req.params.roleId);
    const result = await permissionService.getRolePermissions(roleId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getRolePermissions controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
