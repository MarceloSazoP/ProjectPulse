import { db } from '../db';
import type { TaskInput } from '../schemas/taskSchema';

// Tipos de retorno estandarizados
type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export const getTasks = async (filters?: any): Promise<ServiceResponse<any[]>> => {
  try {
    let query = `
      SELECT t.*, p.name as project_name, u.name as assignee_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
    `;
    
    const queryParams: any[] = [];
    const conditions: string[] = [];
    
    if (filters) {
      let paramIndex = 1;
      
      if (filters.projectId) {
        conditions.push(`t.project_id = $${paramIndex}`);
        queryParams.push(filters.projectId);
        paramIndex++;
      }
      
      if (filters.assigneeId) {
        conditions.push(`t.assignee_id = $${paramIndex}`);
        queryParams.push(filters.assigneeId);
        paramIndex++;
      }
      
      if (filters.status) {
        conditions.push(`t.status = $${paramIndex}`);
        queryParams.push(filters.status);
        paramIndex++;
      }
      
      if (filters.priority) {
        conditions.push(`t.priority = $${paramIndex}`);
        queryParams.push(filters.priority);
        paramIndex++;
      }
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY t.due_date ASC NULLS LAST, t.priority DESC';
    
    const tasks = await db.query(query, queryParams);
    
    return { success: true, data: tasks };
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    return { success: false, error: 'Error al obtener tareas' };
  }
};

export const getTaskById = async (id: number): Promise<ServiceResponse<any>> => {
  try {
    const [task] = await db.query(`
      SELECT t.*, p.name as project_name, u.name as assignee_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = $1
    `, [id]);
    
    if (!task) {
      return { success: false, error: 'Tarea no encontrada' };
    }
    
    return { success: true, data: task };
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    return { success: false, error: 'Error al obtener tarea' };
  }
};

export const createTask = async (taskData: TaskInput): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si el proyecto existe (si se proporciona)
    if (taskData.project_id) {
      const [project] = await db.query('SELECT * FROM projects WHERE id = $1', [taskData.project_id]);
      
      if (!project) {
        return { success: false, error: 'El proyecto especificado no existe' };
      }
    }
    
    // Verificar si el asignado existe (si se proporciona)
    if (taskData.assignee_id) {
      const [assignee] = await db.query('SELECT * FROM users WHERE id = $1', [taskData.assignee_id]);
      
      if (!assignee) {
        return { success: false, error: 'El usuario asignado especificado no existe' };
      }
    }
    
    const [newTask] = await db.query(
      `INSERT INTO tasks 
       (name, description, status, priority, due_date, project_id, assignee_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        taskData.name,
        taskData.description,
        taskData.status,
        taskData.priority,
        taskData.due_date,
        taskData.project_id,
        taskData.assignee_id
      ]
    );
    
    return { success: true, data: newTask };
  } catch (error) {
    console.error('Error al crear tarea:', error);
    return { success: false, error: 'Error al crear tarea' };
  }
};

export const updateTask = async (id: number, taskData: Partial<TaskInput>): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si la tarea existe
    const [task] = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (!task) {
      return { success: false, error: 'Tarea no encontrada' };
    }
    
    // Verificar si el proyecto existe (si se proporciona)
    if (taskData.project_id) {
      const [project] = await db.query('SELECT * FROM projects WHERE id = $1', [taskData.project_id]);
      
      if (!project) {
        return { success: false, error: 'El proyecto especificado no existe' };
      }
    }
    
    // Verificar si el asignado existe (si se proporciona)
    if (taskData.assignee_id) {
      const [assignee] = await db.query('SELECT * FROM users WHERE id = $1', [taskData.assignee_id]);
      
      if (!assignee) {
        return { success: false, error: 'El usuario asignado especificado no existe' };
      }
    }
    
    const [updatedTask] = await db.query(
      `UPDATE tasks SET 
        name = $1, 
        description = $2,
        status = $3,
        priority = $4,
        due_date = $5,
        project_id = $6,
        assignee_id = $7
       WHERE id = $8 
       RETURNING *`,
      [
        taskData.name || task.name,
        taskData.description !== undefined ? taskData.description : task.description,
        taskData.status || task.status,
        taskData.priority || task.priority,
        taskData.due_date !== undefined ? taskData.due_date : task.due_date,
        taskData.project_id !== undefined ? taskData.project_id : task.project_id,
        taskData.assignee_id !== undefined ? taskData.assignee_id : task.assignee_id,
        id
      ]
    );
    
    return { success: true, data: updatedTask };
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    return { success: false, error: 'Error al actualizar tarea' };
  }
};

export const deleteTask = async (id: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si la tarea existe
    const [task] = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (!task) {
      return { success: false, error: 'Tarea no encontrada' };
    }
    
    await db.query('DELETE FROM tasks WHERE id = $1', [id]);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    return { success: false, error: 'Error al eliminar tarea' };
  }
};

export const updateTaskStatus = async (id: number, status: string): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si la tarea existe
    const [task] = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (!task) {
      return { success: false, error: 'Tarea no encontrada' };
    }
    
    // Verificar que el estado es válido
    const validStatuses = ['backlog', 'todo', 'todo_today', 'in_progress', 'end'];
    if (!validStatuses.includes(status)) {
      return { success: false, error: 'Estado no válido' };
    }
    
    const [updatedTask] = await db.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    return { success: true, data: updatedTask };
  } catch (error) {
    console.error('Error al actualizar estado de tarea:', error);
    return { success: false, error: 'Error al actualizar estado de tarea' };
  }
};

export const assignTask = async (id: number, userId: number): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si la tarea existe
    const [task] = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);
    
    if (!task) {
      return { success: false, error: 'Tarea no encontrada' };
    }
    
    // Verificar si el usuario existe
    const [user] = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    const [updatedTask] = await db.query(
      'UPDATE tasks SET assignee_id = $1 WHERE id = $2 RETURNING *',
      [userId, id]
    );
    
    return { success: true, data: updatedTask };
  } catch (error) {
    console.error('Error al asignar tarea:', error);
    return { success: false, error: 'Error al asignar tarea' };
  }
};