
import { query } from '../db';

// Interfaz para los datos de una tarea
export interface Task {
  id?: number;
  name: string;
  description?: string;
  status: 'backlog' | 'todo' | 'todo_today' | 'in_progress' | 'end';
  priority: 'low' | 'medium' | 'high';
  due_date?: Date;
  project_id: number;
  assignee_id?: number;
}

// Obtener todas las tareas
export async function getAllTasks(): Promise<Task[]> {
  const sql = 'SELECT * FROM tasks ORDER BY id DESC';
  // En producción, descomentar la siguiente línea:
  // return await query(sql);
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql);
  return [
    {
      id: 1,
      name: 'Tarea Demo 1',
      description: 'Esta es una tarea de demostración',
      status: 'todo',
      priority: 'medium',
      due_date: new Date(new Date().setDate(new Date().getDate() + 7)),
      project_id: 1,
      assignee_id: 1
    },
    {
      id: 2,
      name: 'Tarea Demo 2',
      description: 'Esta es otra tarea de demostración',
      status: 'in_progress',
      priority: 'high',
      due_date: new Date(new Date().setDate(new Date().getDate() + 3)),
      project_id: 1,
      assignee_id: 2
    }
  ];
}

// Obtener tareas por proyecto
export async function getTasksByProject(projectId: number): Promise<Task[]> {
  const sql = 'SELECT * FROM tasks WHERE project_id = $1 ORDER BY id DESC';
  // En producción, descomentar la siguiente línea:
  // return await query(sql, [projectId]);
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, [projectId]);
  return [
    {
      id: 1,
      name: 'Tarea del proyecto ' + projectId,
      description: 'Esta es una tarea del proyecto ' + projectId,
      status: 'todo',
      priority: 'medium',
      due_date: new Date(new Date().setDate(new Date().getDate() + 7)),
      project_id: projectId,
      assignee_id: 1
    },
    {
      id: 2,
      name: 'Otra tarea del proyecto ' + projectId,
      description: 'Esta es otra tarea del proyecto ' + projectId,
      status: 'in_progress',
      priority: 'high',
      due_date: new Date(new Date().setDate(new Date().getDate() + 3)),
      project_id: projectId,
      assignee_id: 2
    }
  ];
}

// Obtener una tarea por ID
export async function getTaskById(id: number): Promise<Task | null> {
  const sql = 'SELECT * FROM tasks WHERE id = $1';
  // En producción, descomentar la siguiente línea:
  // const results = await query(sql, [id]);
  // return results.length ? results[0] : null;
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, [id]);
  return {
    id: id,
    name: 'Tarea ' + id,
    description: 'Descripción de la tarea ' + id,
    status: 'todo',
    priority: 'medium',
    due_date: new Date(new Date().setDate(new Date().getDate() + 7)),
    project_id: 1,
    assignee_id: 1
  };
}

// Crear una nueva tarea
export async function createTask(taskData: Task): Promise<Task> {
  const { name, description, status, priority, due_date, project_id, assignee_id } = taskData;
  
  const sql = `
    INSERT INTO tasks (name, description, status, priority, due_date, project_id, assignee_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  
  const values = [name, description, status, priority, due_date, project_id, assignee_id];
  
  // En producción, descomentar la siguiente línea:
  // const result = await query(sql, values);
  // return result[0];
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, values);
  return {
    id: Math.floor(Math.random() * 1000),
    ...taskData
  };
}

// Actualizar una tarea
export async function updateTask(id: number, taskData: Partial<Task>): Promise<Task | null> {
  // Construir la consulta de actualización dinámicamente
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  // Añadir cada campo a actualizar
  for (const [key, value] of Object.entries(taskData)) {
    if (value !== undefined) {
      updates.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }
  
  // Añadir el ID como último parámetro
  values.push(id);
  
  if (updates.length === 0) {
    return getTaskById(id);
  }
  
  const sql = `
    UPDATE tasks
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  // En producción, descomentar la siguiente línea:
  // const results = await query(sql, values);
  // return results.length ? results[0] : null;
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, values);
  return {
    id: id,
    name: taskData.name || 'Tarea actualizada',
    description: taskData.description || 'Descripción actualizada',
    status: taskData.status || 'in_progress',
    priority: taskData.priority || 'high',
    due_date: taskData.due_date || new Date(new Date().setDate(new Date().getDate() + 5)),
    project_id: taskData.project_id || 1,
    assignee_id: taskData.assignee_id || 2
  };
}

// Eliminar una tarea
export async function deleteTask(id: number): Promise<boolean> {
  const sql = 'DELETE FROM tasks WHERE id = $1 RETURNING id';
  
  // En producción, descomentar la siguiente línea:
  // const results = await query(sql, [id]);
  // return results.length > 0;
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, [id]);
  return true;
}
