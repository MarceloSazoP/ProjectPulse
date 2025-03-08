
import { z } from 'zod';

// Schema para tableros Kanban
export const kanbanBoardSchema = z.object({
  name: z.string().min(1, "El nombre del tablero es requerido"),
  description: z.string().optional(),
  project_id: z.number().optional()
});

// Schema para columnas Kanban
export const kanbanColumnSchema = z.object({
  board_id: z.number(),
  name: z.string().min(1, "El nombre de la columna es requerido"),
  order_index: z.number().default(0)
});

// Schema para tarjetas Kanban
export const kanbanCardSchema = z.object({
  column_id: z.number(),
  title: z.string().min(1, "El título de la tarjeta es requerido"),
  description: z.string().optional(),
  assigned_to: z.number().optional(),
  due_date: z.string().optional().refine(value => {
    if (!value) return true;
    return !isNaN(Date.parse(value));
  }, "La fecha debe ser válida"),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  order_index: z.number().default(0)
});

// Tipos exportados
export type KanbanBoardInput = z.infer<typeof kanbanBoardSchema>;
export type KanbanColumnInput = z.infer<typeof kanbanColumnSchema>;
export type KanbanCardInput = z.infer<typeof kanbanCardSchema>;
