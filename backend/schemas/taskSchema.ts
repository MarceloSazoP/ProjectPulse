
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
import { z } from 'zod';

// Esquema para validar la creación de tareas
export const createTaskSchema = z.object({
  name: z.string().min(1, 'El nombre de la tarea es obligatorio'),
  description: z.string().optional(),
  status: z.enum(['backlog', 'todo', 'todo_today', 'in_progress', 'end']),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().optional().transform(date => date ? new Date(date) : undefined),
  project_id: z.number(),
  assignee_id: z.number().optional()
});

// Esquema para validar la actualización de tareas
export const updateTaskSchema = z.object({
  name: z.string().min(1, 'El nombre de la tarea es obligatorio').optional(),
  description: z.string().optional(),
  status: z.enum(['backlog', 'todo', 'todo_today', 'in_progress', 'end']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  due_date: z.string().optional().transform(date => date ? new Date(date) : undefined),
  project_id: z.number().optional(),
  assignee_id: z.number().optional()
});

// Esquema para validar la asignación de tareas a usuarios
export const assignTaskToUserSchema = z.object({
  userId: z.number()
});

// Tipos derivados de los esquemas
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type AssignTaskToUserInput = z.infer<typeof assignTaskToUserSchema>;
