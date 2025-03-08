import { z } from 'zod';

export const logSchema = z.object({
  action: z.string().min(1, "La acción es requerida"),
  entity: z.string().min(1, "La entidad es requerida"),
  entity_id: z.number().optional(),
  user_id: z.number().optional(),
  details: z.string().optional(),
  timestamp: z.string().optional().default(() => new Date().toISOString())
});

export type LogInput = z.infer<typeof logSchema>;