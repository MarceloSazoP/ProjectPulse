
import { query } from '../db';

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
      name: 'Tarea Demo',
      description: 'Esta es una tarea de demostración',
      status: 'todo',
      priority: 'medium',
      due_date: new Date(new Date().setDate(new Date().getDate() + 7)),
      project_id: 1,
      assignee_id: 1
    }
  ];
}

// Obtener tareas por proyecto
export async function getTasksByProject(projectId: number): Promise<Task[]> {
  const sql = 'SELECT * FROM tasks WHERE project_id = $1 ORDER BY id DESC';
  // En producción, descomentar la siguiente línea:
  // return await query(sql, [projectId]);
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, 'con projectId:', projectId);
  return [
    {
      id: 1,
      name: 'Tarea Demo 1',
      description: 'Esta es una tarea de demostración',
      status: 'todo',
      priority: 'medium',
      due_date: new Date(new Date().setDate(new Date().getDate() + 7)),
      project_id: projectId,
      assignee_id: 1
    },
    {
      id: 2,
      name: 'Tarea Demo 2',
      description: 'Esta es otra tarea de demostración',
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
  // const result = await query(sql, [id]);
  // return result.length > 0 ? result[0] : null;
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, 'con id:', id);
  if (id === 1) {
    return {
      id: 1,
      name: 'Tarea Demo',
      description: 'Esta es una tarea de demostración',
      status: 'todo',
      priority: 'medium',
      due_date: new Date(new Date().setDate(new Date().getDate() + 7)),
      project_id: 1,
      assignee_id: 1
    };
  }
  return null;
}

// Crear una nueva tarea
export async function createTask(task: Task): Promise<Task> {
  const sql = `
    INSERT INTO tasks (name, description, status, priority, due_date, project_id, assignee_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  // En producción, descomentar la siguiente línea:
  // return (await query(sql, [
  //   task.name,
  //   task.description,
  //   task.status,
  //   task.priority,
  //   task.due_date,
  //   task.project_id,
  //   task.assignee_id
  // ]))[0];
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, 'con datos:', task);
  return {
    id: Math.floor(Math.random() * 1000) + 1,
    ...task
  };
}

// Actualizar una tarea existente
export async function updateTask(id: number, task: Partial<Task>): Promise<Task | null> {
  // Primero, verificar si la tarea existe
  const existingTask = await getTaskById(id);
  if (!existingTask) {
    return null;
  }

  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  // Construir dinámicamente la consulta SQL según los campos proporcionados
  if (task.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(task.name);
  }
  if (task.description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(task.description);
  }
  if (task.status !== undefined) {
    updates.push(`status = $${paramCount++}`);
    values.push(task.status);
  }
  if (task.priority !== undefined) {
    updates.push(`priority = $${paramCount++}`);
    values.push(task.priority);
  }
  if (task.due_date !== undefined) {
    updates.push(`due_date = $${paramCount++}`);
    values.push(task.due_date);
  }
  if (task.project_id !== undefined) {
    updates.push(`project_id = $${paramCount++}`);
    values.push(task.project_id);
  }
  if (task.assignee_id !== undefined) {
    updates.push(`assignee_id = $${paramCount++}`);
    values.push(task.assignee_id);
  }

  // Si no hay nada que actualizar, devolver la tarea existente
  if (updates.length === 0) {
    return existingTask;
  }

  const sql = `
    UPDATE tasks
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  values.push(id);

  // En producción, descomentar la siguiente línea:
  // return (await query(sql, values))[0];
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, 'con valores:', values);
  return {
    ...existingTask,
    ...task,
    id
  };
}

// Eliminar una tarea
export async function deleteTask(id: number): Promise<boolean> {
  const sql = 'DELETE FROM tasks WHERE id = $1 RETURNING id';
  // En producción, descomentar la siguiente línea:
  // const result = await query(sql, [id]);
  // return result.length > 0;
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, 'con id:', id);
  return true;
}

// Asignar tarea a un usuario
export async function assignTaskToUser(taskId: number, userId: number): Promise<Task | null> {
  const existingTask = await getTaskById(taskId);
  if (!existingTask) {
    return null;
  }

  const sql = `
    UPDATE tasks
    SET assignee_id = $1
    WHERE id = $2
    RETURNING *
  `;
  // En producción, descomentar la siguiente línea:
  // return (await query(sql, [userId, taskId]))[0];
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, 'con userId:', userId, 'y taskId:', taskId);
  return {
    ...existingTask,
    assignee_id: userId
  };
}
