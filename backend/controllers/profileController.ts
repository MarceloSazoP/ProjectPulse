
import { Request, Response } from 'express';
import * as profileService from '../services/profileService';
import { profileSchema } from '../schemas/profileSchema';
import * as logService from '../services/logService';

export const getProfileByUserId = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = await profileService.getProfileByUserId(userId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getProfileByUserId controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createProfile = async (req: Request, res: Response) => {
  try {
    const profileData = profileSchema.parse(req.body);
    
    // Verificar que el usuario tiene permisos para crear este perfil
    if (req.user && req.user.id !== profileData.user_id) {
      return res.status(403).json({ error: 'No tienes permisos para crear este perfil' });
    }
    
    const result = await profileService.createProfile(profileData);
    
    if (result.success) {
      await logService.createLog({
        action: 'create_profile',
        entity: 'profiles',
        entity_id: profileData.user_id,
        details: `Perfil creado para usuario ID: ${profileData.user_id}`,
        user_id: req.user?.id
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in createProfile controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const profileData = req.body;
    
    // Verificar que el usuario tiene permisos para actualizar este perfil
    if (req.user && req.user.id !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar este perfil' });
    }
    
    const result = await profileService.updateProfile(userId, profileData);
    
    if (result.success) {
      await logService.createLog({
        action: 'update_profile',
        entity: 'profiles',
        entity_id: userId,
        details: `Perfil actualizado para usuario ID: ${userId}`,
        user_id: req.user?.id
      });
      
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in updateProfile controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
