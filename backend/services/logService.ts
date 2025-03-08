
import { db } from '../db';
import type { LogInput } from '../schemas/logSchema';

// Tipos de retorno estandarizados
type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export const getLogs = async (
  page: number = 1, 
  limit: number = 50, 
  filters: any = {}
): Promise<ServiceResponse<{logs: any[], total: number}>> => {
  try {
    let query = 'SELECT * FROM logs';
    const queryParams: any[] = [];
    let conditions = [];
    
    // Aplicar filtros
    if (filters.action) {
      queryParams.push(filters.action);
      conditions.push(`action = $${queryParams.length}`);
    }
    
    if (filters.entity) {
      queryParams.push(filters.entity);
      conditions.push(`entity = $${queryParams.length}`);
    }
    
    if (filters.entity_id) {
      queryParams.push(filters.entity_id);
      conditions.push(`entity_id = $${queryParams.length}`);
    }
    
    if (filters.user_id) {
      queryParams.push(filters.user_id);
      conditions.push(`user_id = $${queryParams.length}`);
    }
    
    if (filters.startDate && filters.endDate) {
      queryParams.push(filters.startDate);
      queryParams.push(filters.endDate);
      conditions.push(`timestamp BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`);
    } else if (filters.startDate) {
      queryParams.push(filters.startDate);
      conditions.push(`timestamp >= $${queryParams.length}`);
    } else if (filters.endDate) {
      queryParams.push(filters.endDate);
      conditions.push(`timestamp <= $${queryParams.length}`);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Contar total para paginación
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const [countResult] = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.total);
    
    // Aplicar orden y paginación
    query += ' ORDER BY timestamp DESC';
    
    const offset = (page - 1) * limit;
    queryParams.push(limit);
    queryParams.push(offset);
    query += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;
    
    const logs = await db.query(query, queryParams);
    
    return { 
      success: true, 
      data: {
        logs,
        total
      }
    };
  } catch (error) {
    console.error('Error al obtener logs:', error);
    return { success: false, error: 'Error al obtener logs' };
  }
};

export const getLogById = async (id: number): Promise<ServiceResponse<any>> => {
  try {
    const [log] = await db.query('SELECT * FROM logs WHERE id = $1', [id]);
    
    if (!log) {
      return { success: false, error: 'Log no encontrado' };
    }
    
    return { success: true, data: log };
  } catch (error) {
    console.error('Error al obtener log:', error);
    return { success: false, error: 'Error al obtener log' };
  }
};

export const createLog = async (logData: LogInput): Promise<ServiceResponse<any>> => {
  try {
    const [newLog] = await db.query(
      `INSERT INTO logs (action, entity, entity_id, user_id, details, timestamp) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        logData.action,
        logData.entity,
        logData.entity_id,
        logData.user_id,
        logData.details,
        logData.timestamp || new Date().toISOString()
      ]
    );
    
    return { success: true, data: newLog };
  } catch (error) {
    console.error('Error al crear log:', error);
    return { success: false, error: 'Error al crear log' };
  }
};

export const deleteLog = async (id: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si el log existe
    const [log] = await db.query('SELECT * FROM logs WHERE id = $1', [id]);
    
    if (!log) {
      return { success: false, error: 'Log no encontrado' };
    }
    
    await db.query('DELETE FROM logs WHERE id = $1', [id]);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar log:', error);
    return { success: false, error: 'Error al eliminar log' };
  }
};

export const clearLogs = async (): Promise<ServiceResponse<void>> => {
  try {
    await db.query('DELETE FROM logs');
    return { success: true };
  } catch (error) {
    console.error('Error al limpiar logs:', error);
    return { success: false, error: 'Error al limpiar logs' };
  }
};

export const getUserLogs = async (userId: number): Promise<ServiceResponse<any[]>> => {
  try {
    const logs = await db.query(
      'SELECT * FROM logs WHERE user_id = $1 ORDER BY timestamp DESC', 
      [userId]
    );
    
    return { success: true, data: logs };
  } catch (error) {
    console.error('Error al obtener logs del usuario:', error);
    return { success: false, error: 'Error al obtener logs del usuario' };
  }
};

export const getEntityLogs = async (entity: string, entityId: number): Promise<ServiceResponse<any[]>> => {
  try {
    const logs = await db.query(
      'SELECT * FROM logs WHERE entity = $1 AND entity_id = $2 ORDER BY timestamp DESC', 
      [entity, entityId]
    );
    
    return { success: true, data: logs };
  } catch (error) {
    console.error('Error al obtener logs de la entidad:', error);
    return { success: false, error: 'Error al obtener logs de la entidad' };
  }
};
