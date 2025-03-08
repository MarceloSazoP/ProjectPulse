
import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(1, "El nombre del proyecto es requerido"),
  description: z.string().optional(),
  start_date: z.string().refine(value => {
    return !isNaN(Date.parse(value));
  }, "Fecha de inicio inválida"),
  end_date: z.string().refine(value => {
    return !isNaN(Date.parse(value));
  }, "Fecha de fin inválida"),
  status: z.enum(['planning', 'active', 'completed', 'on_hold']),
  budget: z.number().optional(),
  manager_id: z.number().optional(),
  department_id: z.number().optional(),
  files: z.array(z.string()).optional()
});

export type ProjectInput = z.infer<typeof projectSchema>;
