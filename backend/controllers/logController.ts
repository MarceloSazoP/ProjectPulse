
import { Request, Response } from 'express';
import * as logService from '../services/logService';
import { logSchema } from '../schemas/logSchema';

export const getLogs = async (req: Request, res: Response) => {
  try {
    const result = await logService.getLogs();
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getLogs controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createLog = async (req: Request, res: Response) => {
  try {
    const logData = logSchema.parse(req.body);
    const result = await logService.createLog(logData);
    
    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in createLog controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const getLogsByEntity = async (req: Request, res: Response) => {
  try {
    const entity = req.params.entity;
    const entityId = parseInt(req.params.entityId);
    
    const result = await logService.getLogsByEntity(entity, entityId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getLogsByEntity controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getLogsByUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const result = await logService.getLogsByUser(userId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getLogsByUser controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
