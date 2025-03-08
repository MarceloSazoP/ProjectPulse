
import { Request, Response } from 'express';
import * as roleService from '../services/roleService';
import { roleSchema, userRoleSchema } from '../schemas/roleSchema';
import * as logService from '../services/logService';

export const getRoles = async (req: Request, res: Response) => {
  try {
    const result = await roleService.getRoles();
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getRoles controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await roleService.getRoleById(id);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getRoleById controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const roleData = roleSchema.parse(req.body);
    const result = await roleService.createRole(roleData);
    
    if (result.success) {
      await logService.createLog({
        action: 'create_role',
        entity: 'roles',
        entity_id: result.data.id,
        details: `Rol creado: ${roleData.name}`,
        user_id: req.user?.id
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in createRole controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const roleData = req.body;
    
    const result = await roleService.updateRole(id, roleData);
    
    if (result.success) {
      await logService.createLog({
        action: 'update_role',
        entity: 'roles',
        entity_id: id,
        details: `Rol actualizado: ID ${id}`,
        user_id: req.user?.id
      });
      
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in updateRole controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await roleService.deleteRole(id);
    
    if (result.success) {
      await logService.createLog({
        action: 'delete_role',
        entity: 'roles',
        entity_id: id,
        details: `Rol eliminado: ID ${id}`,
        user_id: req.user?.id
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in deleteRole controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const assignRoleToUser = async (req: Request, res: Response) => {
  try {
    const assignmentData = userRoleSchema.parse(req.body);
    const result = await roleService.assignRoleToUser(assignmentData);
    
    if (result.success) {
      await logService.createLog({
        action: 'assign_role',
        entity: 'users_roles',
        entity_id: assignmentData.user_id,
        details: `Rol ID ${assignmentData.role_id} asignado al usuario ID ${assignmentData.user_id}`,
        user_id: req.user?.id
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in assignRoleToUser controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const removeRoleFromUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const roleId = parseInt(req.params.roleId);
    
    const result = await roleService.removeRoleFromUser(userId, roleId);
    
    if (result.success) {
      await logService.createLog({
        action: 'remove_role',
        entity: 'users_roles',
        entity_id: userId,
        details: `Rol ID ${roleId} removido del usuario ID ${userId}`,
        user_id: req.user?.id
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in removeRoleFromUser controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getUserRoles = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = await roleService.getUserRoles(userId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getUserRoles controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
