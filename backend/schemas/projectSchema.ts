
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
import { z } from 'zod';

// Esquema para validar la creación de proyectos
export const createProjectSchema = z.object({
  name: z.string().min(1, 'El nombre del proyecto es obligatorio'),
  description: z.string().optional(),
  start_date: z.string().optional().transform(date => date ? new Date(date) : undefined),
  end_date: z.string().optional().transform(date => date ? new Date(date) : undefined),
  status: z.enum(['Planned', 'In Progress', 'Completed']).default('Planned'),
  created_by: z.number().optional()
});

// Esquema para validar la actualización de proyectos
export const updateProjectSchema = z.object({
  name: z.string().min(1, 'El nombre del proyecto es obligatorio').optional(),
  description: z.string().optional(),
  start_date: z.string().optional().transform(date => date ? new Date(date) : undefined),
  end_date: z.string().optional().transform(date => date ? new Date(date) : undefined),
  status: z.enum(['Planned', 'In Progress', 'Completed']).optional()
});

// Esquema para validar la asignación de equipos a proyectos
export const assignTeamToProjectSchema = z.object({
  teamId: z.number(),
  projectId: z.number()
});

// Tipos derivados de los esquemas
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AssignTeamToProjectInput = z.infer<typeof assignTeamToProjectSchema>;
