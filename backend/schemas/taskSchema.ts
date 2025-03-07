
import { z } from 'zod';

// Esquema base para tareas
export const taskSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  status: z.enum(['backlog', 'todo', 'todo_today', 'in_progress', 'end']),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.date().optional(),
  project_id: z.number(),
  assignee_id: z.number().optional()
});

// Esquema para crear una tarea
export const createTaskSchema = taskSchema;

// Esquema para actualizar una tarea (todos los campos son opcionales)
export const updateTaskSchema = taskSchema.partial();

// Tipo para crear una tarea
export type CreateTask = z.infer<typeof createTaskSchema>;

// Tipo para actualizar una tarea
export type UpdateTask = z.infer<typeof updateTaskSchema>;
