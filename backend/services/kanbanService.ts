
import { db } from '../db';
import type { KanbanBoardInput, KanbanColumnInput, KanbanCardInput } from '../schemas/kanbanSchema';

// Tipos de retorno estandarizados
type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Tableros Kanban
export const getKanbanBoards = async (projectId: number): Promise<ServiceResponse<any[]>> => {
  try {
    const boards = await db.query(
      'SELECT * FROM kanban_boards WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
    
    return { success: true, data: boards };
  } catch (error) {
    console.error('Error al obtener tableros Kanban:', error);
    return { success: false, error: 'Error al obtener tableros Kanban' };
  }
};

export const getKanbanBoardById = async (id: number): Promise<ServiceResponse<any>> => {
  try {
    const [board] = await db.query('SELECT * FROM kanban_boards WHERE id = $1', [id]);
    
    if (!board) {
      return { success: false, error: 'Tablero Kanban no encontrado' };
    }
    
    return { success: true, data: board };
  } catch (error) {
    console.error('Error al obtener tablero Kanban:', error);
    return { success: false, error: 'Error al obtener tablero Kanban' };
  }
};

export const createKanbanBoard = async (boardData: KanbanBoardInput): Promise<ServiceResponse<any>> => {
  try {
    const [newBoard] = await db.query(
      'INSERT INTO kanban_boards (name, description, project_id, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [boardData.name, boardData.description, boardData.project_id, boardData.created_by]
    );
    
    return { success: true, data: newBoard };
  } catch (error) {
    console.error('Error al crear tablero Kanban:', error);
    return { success: false, error: 'Error al crear tablero Kanban' };
  }
};

export const updateKanbanBoard = async (id: number, boardData: Partial<KanbanBoardInput>): Promise<ServiceResponse<any>> => {
  try {
    const [board] = await db.query('SELECT * FROM kanban_boards WHERE id = $1', [id]);
    
    if (!board) {
      return { success: false, error: 'Tablero Kanban no encontrado' };
    }
    
    const [updatedBoard] = await db.query(
      'UPDATE kanban_boards SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [
        boardData.name || board.name,
        boardData.description !== undefined ? boardData.description : board.description,
        id
      ]
    );
    
    return { success: true, data: updatedBoard };
  } catch (error) {
    console.error('Error al actualizar tablero Kanban:', error);
    return { success: false, error: 'Error al actualizar tablero Kanban' };
  }
};

export const deleteKanbanBoard = async (id: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si el tablero existe
    const [board] = await db.query('SELECT * FROM kanban_boards WHERE id = $1', [id]);
    
    if (!board) {
      return { success: false, error: 'Tablero Kanban no encontrado' };
    }
    
    // Primero eliminar todas las dependencias de las tarjetas asociadas a este tablero
    await db.query(`
      DELETE FROM kanban_card_dependencies 
      WHERE card_id IN (
        SELECT kc.id FROM kanban_cards kc
        JOIN kanban_columns kcol ON kc.column_id = kcol.id
        WHERE kcol.board_id = $1
      ) OR depends_on_card_id IN (
        SELECT kc.id FROM kanban_cards kc
        JOIN kanban_columns kcol ON kc.column_id = kcol.id
        WHERE kcol.board_id = $1
      )
    `, [id]);
    
    // Luego eliminar todas las tarjetas asociadas a las columnas de este tablero
    await db.query(`
      DELETE FROM kanban_cards 
      WHERE column_id IN (
        SELECT id FROM kanban_columns WHERE board_id = $1
      )
    `, [id]);
    
    // Eliminar todas las columnas asociadas a este tablero
    await db.query('DELETE FROM kanban_columns WHERE board_id = $1', [id]);
    
    // Finalmente eliminar el tablero
    await db.query('DELETE FROM kanban_boards WHERE id = $1', [id]);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar tablero Kanban:', error);
    return { success: false, error: 'Error al eliminar tablero Kanban' };
  }
};

// Columnas Kanban
export const getKanbanColumns = async (boardId: number): Promise<ServiceResponse<any[]>> => {
  try {
    const columns = await db.query(
      'SELECT * FROM kanban_columns WHERE board_id = $1 ORDER BY order_index ASC',
      [boardId]
    );
    
    return { success: true, data: columns };
  } catch (error) {
    console.error('Error al obtener columnas Kanban:', error);
    return { success: false, error: 'Error al obtener columnas Kanban' };
  }
};

export const createKanbanColumn = async (columnData: KanbanColumnInput): Promise<ServiceResponse<any>> => {
  try {
    // Obtener el último índice para ordenar correctamente
    const [maxIndex] = await db.query(
      'SELECT COALESCE(MAX(order_index), -1) as max_index FROM kanban_columns WHERE board_id = $1',
      [columnData.board_id]
    );
    
    const newIndex = (maxIndex.max_index + 1) || 0;
    
    const [newColumn] = await db.query(
      'INSERT INTO kanban_columns (board_id, name, order_index) VALUES ($1, $2, $3) RETURNING *',
      [columnData.board_id, columnData.name, newIndex]
    );
    
    return { success: true, data: newColumn };
  } catch (error) {
    console.error('Error al crear columna Kanban:', error);
    return { success: false, error: 'Error al crear columna Kanban' };
  }
};

export const updateKanbanColumn = async (id: number, columnData: Partial<KanbanColumnInput>): Promise<ServiceResponse<any>> => {
  try {
    const [column] = await db.query('SELECT * FROM kanban_columns WHERE id = $1', [id]);
    
    if (!column) {
      return { success: false, error: 'Columna Kanban no encontrada' };
    }
    
    const [updatedColumn] = await db.query(
      'UPDATE kanban_columns SET name = $1, order_index = $2 WHERE id = $3 RETURNING *',
      [
        columnData.name || column.name,
        columnData.order_index !== undefined ? columnData.order_index : column.order_index,
        id
      ]
    );
    
    return { success: true, data: updatedColumn };
  } catch (error) {
    console.error('Error al actualizar columna Kanban:', error);
    return { success: false, error: 'Error al actualizar columna Kanban' };
  }
};

export const deleteKanbanColumn = async (id: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si la columna existe
    const [column] = await db.query('SELECT * FROM kanban_columns WHERE id = $1', [id]);
    
    if (!column) {
      return { success: false, error: 'Columna Kanban no encontrada' };
    }
    
    // Primero eliminar todas las dependencias de las tarjetas asociadas a esta columna
    await db.query(`
      DELETE FROM kanban_card_dependencies 
      WHERE card_id IN (SELECT id FROM kanban_cards WHERE column_id = $1)
      OR depends_on_card_id IN (SELECT id FROM kanban_cards WHERE column_id = $1)
    `, [id]);
    
    // Luego eliminar todas las tarjetas asociadas a esta columna
    await db.query('DELETE FROM kanban_cards WHERE column_id = $1', [id]);
    
    // Finalmente eliminar la columna
    await db.query('DELETE FROM kanban_columns WHERE id = $1', [id]);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar columna Kanban:', error);
    return { success: false, error: 'Error al eliminar columna Kanban' };
  }
};

// Tarjetas Kanban
export const getKanbanCards = async (columnId: number): Promise<ServiceResponse<any[]>> => {
  try {
    const cards = await db.query(
      'SELECT * FROM kanban_cards WHERE column_id = $1 ORDER BY order_index ASC',
      [columnId]
    );
    
    return { success: true, data: cards };
  } catch (error) {
    console.error('Error al obtener tarjetas Kanban:', error);
    return { success: false, error: 'Error al obtener tarjetas Kanban' };
  }
};

export const createKanbanCard = async (cardData: KanbanCardInput): Promise<ServiceResponse<any>> => {
  try {
    // Obtener el último índice para ordenar correctamente
    const [maxIndex] = await db.query(
      'SELECT COALESCE(MAX(order_index), -1) as max_index FROM kanban_cards WHERE column_id = $1',
      [cardData.column_id]
    );
    
    const newIndex = (maxIndex.max_index + 1) || 0;
    
    const [newCard] = await db.query(
      `INSERT INTO kanban_cards 
       (column_id, title, description, assigned_to, due_date, priority, order_index) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        cardData.column_id, 
        cardData.title, 
        cardData.description, 
        cardData.assigned_to, 
        cardData.due_date, 
        cardData.priority || 'medium', 
        newIndex
      ]
    );
    
    return { success: true, data: newCard };
  } catch (error) {
    console.error('Error al crear tarjeta Kanban:', error);
    return { success: false, error: 'Error al crear tarjeta Kanban' };
  }
};

export const updateKanbanCard = async (id: number, cardData: Partial<KanbanCardInput>): Promise<ServiceResponse<any>> => {
  try {
    const [card] = await db.query('SELECT * FROM kanban_cards WHERE id = $1', [id]);
    
    if (!card) {
      return { success: false, error: 'Tarjeta Kanban no encontrada' };
    }
    
    const [updatedCard] = await db.query(
      `UPDATE kanban_cards SET 
        column_id = $1, 
        title = $2, 
        description = $3,
        assigned_to = $4,
        due_date = $5,
        priority = $6,
        order_index = $7
       WHERE id = $8 
       RETURNING *`,
      [
        cardData.column_id !== undefined ? cardData.column_id : card.column_id,
        cardData.title || card.title,
        cardData.description !== undefined ? cardData.description : card.description,
        cardData.assigned_to !== undefined ? cardData.assigned_to : card.assigned_to,
        cardData.due_date !== undefined ? cardData.due_date : card.due_date,
        cardData.priority || card.priority,
        cardData.order_index !== undefined ? cardData.order_index : card.order_index,
        id
      ]
    );
    
    return { success: true, data: updatedCard };
  } catch (error) {
    console.error('Error al actualizar tarjeta Kanban:', error);
    return { success: false, error: 'Error al actualizar tarjeta Kanban' };
  }
};

export const deleteKanbanCard = async (id: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si la tarjeta existe
    const [card] = await db.query('SELECT * FROM kanban_cards WHERE id = $1', [id]);
    
    if (!card) {
      return { success: false, error: 'Tarjeta Kanban no encontrada' };
    }
    
    // Primero eliminar todas las dependencias asociadas a esta tarjeta
    await db.query(
      'DELETE FROM kanban_card_dependencies WHERE card_id = $1 OR depends_on_card_id = $1',
      [id]
    );
    
    // Finalmente eliminar la tarjeta
    await db.query('DELETE FROM kanban_cards WHERE id = $1', [id]);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar tarjeta Kanban:', error);
    return { success: false, error: 'Error al eliminar tarjeta Kanban' };
  }
};

// Dependencias entre tarjetas
export const getCardDependencies = async (cardId: number): Promise<ServiceResponse<any[]>> => {
  try {
    const dependencies = await db.query(
      `SELECT kcd.*, 
        kc.title as dependent_card_title,
        kc2.title as dependency_card_title
       FROM kanban_card_dependencies kcd
       JOIN kanban_cards kc ON kcd.card_id = kc.id
       JOIN kanban_cards kc2 ON kcd.depends_on_card_id = kc2.id
       WHERE kcd.card_id = $1`,
      [cardId]
    );
    
    return { success: true, data: dependencies };
  } catch (error) {
    console.error('Error al obtener dependencias de tarjetas:', error);
    return { success: false, error: 'Error al obtener dependencias de tarjetas' };
  }
};

export const addCardDependency = async (dependencyData: any): Promise<ServiceResponse<any>> => {
  try {
    // Verificar que las tarjetas existen
    const [card] = await db.query('SELECT * FROM kanban_cards WHERE id = $1', [dependencyData.card_id]);
    const [dependsOnCard] = await db.query('SELECT * FROM kanban_cards WHERE id = $1', [dependencyData.depends_on_card_id]);
    
    if (!card || !dependsOnCard) {
      return { success: false, error: 'Una o ambas tarjetas no existen' };
    }
    
    // Verificar que la dependencia no crea un ciclo
    const hasCycle = await checkForCyclicDependency(
      dependencyData.card_id, 
      dependencyData.depends_on_card_id
    );
    
    if (hasCycle) {
      return { success: false, error: 'La dependencia crearía un ciclo y no está permitida' };
    }
    
    // Verificar que la dependencia no existe ya
    const [existingDependency] = await db.query(
      'SELECT * FROM kanban_card_dependencies WHERE card_id = $1 AND depends_on_card_id = $2',
      [dependencyData.card_id, dependencyData.depends_on_card_id]
    );
    
    if (existingDependency) {
      return { success: false, error: 'Esta dependencia ya existe' };
    }
    
    const [newDependency] = await db.query(
      'INSERT INTO kanban_card_dependencies (card_id, depends_on_card_id) VALUES ($1, $2) RETURNING *',
      [dependencyData.card_id, dependencyData.depends_on_card_id]
    );
    
    return { success: true, data: newDependency };
  } catch (error) {
    console.error('Error al agregar dependencia de tarjeta:', error);
    return { success: false, error: 'Error al agregar dependencia de tarjeta' };
  }
};

export const removeCardDependency = async (id: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si la dependencia existe
    const [dependency] = await db.query('SELECT * FROM kanban_card_dependencies WHERE id = $1', [id]);
    
    if (!dependency) {
      return { success: false, error: 'Dependencia no encontrada' };
    }
    
    await db.query('DELETE FROM kanban_card_dependencies WHERE id = $1', [id]);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar dependencia de tarjeta:', error);
    return { success: false, error: 'Error al eliminar dependencia de tarjeta' };
  }
};

// Función auxiliar para verificar dependencias cíclicas
async function checkForCyclicDependency(cardId: number, dependsOnCardId: number): Promise<boolean> {
  // Si la tarjeta depende de sí misma, es un ciclo
  if (cardId === dependsOnCardId) {
    return true;
  }
  
  // Buscar dependencias de la tarjeta de la que dependería
  const dependencies = await db.query(
    'SELECT depends_on_card_id FROM kanban_card_dependencies WHERE card_id = $1',
    [dependsOnCardId]
  );
  
  // Verificar recursivamente si alguna de esas dependencias crea un ciclo
  for (const dep of dependencies) {
    if (dep.depends_on_card_id === cardId || 
        await checkForCyclicDependency(cardId, dep.depends_on_card_id)) {
      return true;
    }
  }
  
  return false;
}
