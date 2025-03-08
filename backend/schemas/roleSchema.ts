
import { z } from 'zod';

export const roleSchema = z.object({
  name: z.string().min(1, "El nombre del rol es requerido")
});

export const userRoleSchema = z.object({
  user_id: z.number(),
  role_id: z.number()
});

export type RoleInput = z.infer<typeof roleSchema>;
export type UserRoleInput = z.infer<typeof userRoleSchema>;
