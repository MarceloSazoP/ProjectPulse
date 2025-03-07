
import { Request, Response } from 'express';
import * as departmentService from '../services/departmentService';
import { departmentSchema } from '../schemas/departmentSchema';
import * as logService from '../services/logService';

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const result = await departmentService.getDepartments();
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getDepartments controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await departmentService.getDepartmentById(id);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getDepartmentById controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const departmentData = departmentSchema.parse(req.body);
    const result = await departmentService.createDepartment(departmentData);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'create_department',
        description: `Departamento creado: ${departmentData.name}`,
        ip_address: req.ip
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in createDepartment controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const departmentData = req.body;
    
    const result = await departmentService.updateDepartment(id, departmentData);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'update_department',
        description: `Departamento actualizado: ID ${id}`,
        ip_address: req.ip
      });
      
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in updateDepartment controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await departmentService.deleteDepartment(id);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'delete_department',
        description: `Departamento eliminado: ID ${id}`,
        ip_address: req.ip
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in deleteDepartment controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
