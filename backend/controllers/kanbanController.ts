
import { Request, Response } from 'express';
import * as kanbanService from '../services/kanbanService';
import { kanbanBoardSchema, kanbanColumnSchema, kanbanCardSchema, kanbanCardDependencySchema } from '../schemas/kanbanSchema';
import * as logService from '../services/logService';

// Tableros Kanban
export const getKanbanBoards = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const result = await kanbanService.getKanbanBoards(projectId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getKanbanBoards controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getKanbanBoardById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await kanbanService.getKanbanBoardById(id);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getKanbanBoardById controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createKanbanBoard = async (req: Request, res: Response) => {
  try {
    const boardData = kanbanBoardSchema.parse(req.body);
    
    // Asignar el usuario actual como creador si no se especifica
    if (!boardData.created_by && req.user) {
      boardData.created_by = req.user.id;
    }
    
    const result = await kanbanService.createKanbanBoard(boardData);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'create_kanban_board',
        description: `Tablero Kanban creado: ${boardData.name}`,
        ip_address: req.ip
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in createKanbanBoard controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const updateKanbanBoard = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const boardData = req.body;
    
    const result = await kanbanService.updateKanbanBoard(id, boardData);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'update_kanban_board',
        description: `Tablero Kanban actualizado: ID ${id}`,
        ip_address: req.ip
      });
      
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in updateKanbanBoard controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteKanbanBoard = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await kanbanService.deleteKanbanBoard(id);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'delete_kanban_board',
        description: `Tablero Kanban eliminado: ID ${id}`,
        ip_address: req.ip
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in deleteKanbanBoard controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Columnas Kanban
export const getKanbanColumns = async (req: Request, res: Response) => {
  try {
    const boardId = parseInt(req.params.boardId);
    const result = await kanbanService.getKanbanColumns(boardId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getKanbanColumns controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createKanbanColumn = async (req: Request, res: Response) => {
  try {
    const columnData = kanbanColumnSchema.parse(req.body);
    const result = await kanbanService.createKanbanColumn(columnData);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'create_kanban_column',
        description: `Columna Kanban creada: ${columnData.name}`,
        ip_address: req.ip
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in createKanbanColumn controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const updateKanbanColumn = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const columnData = req.body;
    
    const result = await kanbanService.updateKanbanColumn(id, columnData);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'update_kanban_column',
        description: `Columna Kanban actualizada: ID ${id}`,
        ip_address: req.ip
      });
      
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in updateKanbanColumn controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteKanbanColumn = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await kanbanService.deleteKanbanColumn(id);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'delete_kanban_column',
        description: `Columna Kanban eliminada: ID ${id}`,
        ip_address: req.ip
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in deleteKanbanColumn controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Tarjetas Kanban
export const getKanbanCards = async (req: Request, res: Response) => {
  try {
    const columnId = parseInt(req.params.columnId);
    const result = await kanbanService.getKanbanCards(columnId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getKanbanCards controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createKanbanCard = async (req: Request, res: Response) => {
  try {
    const cardData = kanbanCardSchema.parse(req.body);
    const result = await kanbanService.createKanbanCard(cardData);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'create_kanban_card',
        description: `Tarjeta Kanban creada: ${cardData.title}`,
        ip_address: req.ip
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in createKanbanCard controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const updateKanbanCard = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const cardData = req.body;
    
    const result = await kanbanService.updateKanbanCard(id, cardData);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'update_kanban_card',
        description: `Tarjeta Kanban actualizada: ID ${id}`,
        ip_address: req.ip
      });
      
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in updateKanbanCard controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteKanbanCard = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await kanbanService.deleteKanbanCard(id);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'delete_kanban_card',
        description: `Tarjeta Kanban eliminada: ID ${id}`,
        ip_address: req.ip
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in deleteKanbanCard controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Dependencias entre tarjetas
export const getCardDependencies = async (req: Request, res: Response) => {
  try {
    const cardId = parseInt(req.params.cardId);
    const result = await kanbanService.getCardDependencies(cardId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getCardDependencies controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const addCardDependency = async (req: Request, res: Response) => {
  try {
    const dependencyData = kanbanCardDependencySchema.parse(req.body);
    const result = await kanbanService.addCardDependency(dependencyData);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'add_card_dependency',
        description: `Dependencia añadida: Tarjeta ${dependencyData.card_id} depende de ${dependencyData.depends_on_card_id}`,
        ip_address: req.ip
      });
      
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in addCardDependency controller:', error);
    if (error.errors) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

export const removeCardDependency = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await kanbanService.removeCardDependency(id);
    
    if (result.success) {
      // Registrar la acción en logs
      await logService.createLog({
        user_id: req.user?.id,
        action: 'remove_card_dependency',
        description: `Dependencia eliminada: ID ${id}`,
        ip_address: req.ip
      });
      
      res.status(204).send();
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in removeCardDependency controller:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
