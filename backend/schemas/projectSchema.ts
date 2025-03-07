
import { z } from 'zod';

// Esquema base para proyectos
export const projectSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  start_date: z.date(),
  end_date: z.date(),
  status: z.enum(['planning', 'active', 'completed', 'on_hold']),
  budget: z.number().optional(),
  manager_id: z.number().optional(),
  department_id: z.number().optional(),
  files: z.array(z.string()).optional()
});

// Esquema para crear un proyecto
export const createProjectSchema = projectSchema;

// Esquema para actualizar un proyecto (todos los campos son opcionales)
export const updateProjectSchema = projectSchema.partial();

// Tipo para crear un proyecto
export type CreateProject = z.infer<typeof createProjectSchema>;

// Tipo para actualizar un proyecto
export type UpdateProject = z.infer<typeof updateProjectSchema>;
