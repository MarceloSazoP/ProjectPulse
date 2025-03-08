
import { z } from 'zod';
import { departments } from '../../shared/schema';

// Schema para validación de departamentos basado en la tabla SQL
export const departmentSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional()
});

export type DepartmentInput = z.infer<typeof departmentSchema>;
