
import { z } from 'zod';

export const profileSchema = z.object({
  user_id: z.number(),
  bio: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

export type ProfileInput = z.infer<typeof profileSchema>;
