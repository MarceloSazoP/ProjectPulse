
import { z } from 'zod';

export const taskSchema = z.object({
  name: z.string().min(1, "El nombre de la tarea es requerido"),
  description: z.string().optional(),
  status: z.enum(['backlog', 'todo', 'todo_today', 'in_progress', 'end']),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().optional().refine(value => {
    if (!value) return true;
    return !isNaN(Date.parse(value));
  }, "Fecha límite inválida"),
  project_id: z.number().optional(),
  assignee_id: z.number().optional()
});

export type TaskInput = z.infer<typeof taskSchema>;
