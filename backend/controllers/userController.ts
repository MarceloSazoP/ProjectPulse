
import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { userSchema, loginSchema } from '../schemas/userSchema';
import * as logService from '../services/logService';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await userService.getUsers();
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getUsers controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await userService.getUserById(id);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getUserById controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = userSchema.parse(req.body);
    const result = await userService.createUser(userData);
    
    if (result.success) {
      await logService.createLog({
        action: 'create_user',
        entity: 'users',
        entity_id: result.data.id,
        details: `Usuario creado: ${userData.email}`,
        user_id: req.user?.id
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in createUser controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userData = req.body;
    
    const result = await userService.updateUser(id, userData);
    
    if (result.success) {
      await logService.createLog({
        action: 'update_user',
        entity: 'users',
        entity_id: id,
        details: `Usuario actualizado: ID ${id}`,
        user_id: req.user?.id
      });
      
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in updateUser controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await userService.deleteUser(id);
    
    if (result.success) {
      await logService.createLog({
        action: 'delete_user',
        entity: 'users',
        entity_id: id,
        details: `Usuario eliminado: ID ${id}`,
        user_id: req.user?.id
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in deleteUser controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const loginData = loginSchema.parse(req.body);
    const result = await userService.login(loginData);
    
    if (result.success) {
      await logService.createLog({
        action: 'login',
        entity: 'users',
        entity_id: result.data.user.id,
        details: `Inicio de sesión: ${loginData.email}`,
        user_id: result.data.user.id
      });
      
      res.json(result.data);
    } else {
      res.status(401).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in login controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};
