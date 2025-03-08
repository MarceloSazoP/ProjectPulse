
import { z } from 'zod';

export const permissionSchema = z.object({
  name: z.string().min(1, "El nombre del permiso es requerido")
});

export const rolePermissionSchema = z.object({
  role_id: z.number(),
  permission_id: z.number()
});

export type PermissionInput = z.infer<typeof permissionSchema>;
export type RolePermissionInput = z.infer<typeof rolePermissionSchema>;
