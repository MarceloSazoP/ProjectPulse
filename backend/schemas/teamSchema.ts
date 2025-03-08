
import { z } from 'zod';

export const teamSchema = z.object({
  name: z.string().min(1, "El nombre del equipo es requerido"),
  description: z.string().optional()
});

export const teamMemberSchema = z.object({
  team_id: z.number(),
  user_id: z.number()
});

export type TeamInput = z.infer<typeof teamSchema>;
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
