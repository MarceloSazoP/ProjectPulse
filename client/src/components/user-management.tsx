
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Pencil, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const userRoles = ["admin", "manager", "member", "client"];

const userSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "manager", "member", "client"]),
  departmentId: z.number().optional().nullable(),
  profileId: z.number().optional().nullable(),
});

const editUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  role: z.enum(["admin", "manager", "member", "client"]),
  departmentId: z.number().optional().nullable(),
  profileId: z.number().optional().nullable(),
});

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axios.get("/api/users");
      return response.data;
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await axios.get("/api/departments");
      return response.data;
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const response = await axios.get("/api/profiles");
      return response.data;
    },
  });

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "member",
      departmentId: null,
      profileId: null,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof userSchema>) => {
      const response = await axios.post("/api/users", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      form.reset({
        username: "",
        password: "",
        role: "member",
        departmentId: null,
        profileId: null,
      });
      toast({
        title: "Usuario creado",
        description: "El usuario se ha creado correctamente",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof editUserSchema> }) => {
      const response = await axios.put(`/api/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingId(null);
      form.reset({
        username: "",
        password: "",
        role: "member",
        departmentId: null,
        profileId: null,
      });
      toast({
        title: "Usuario actualizado",
        description: "El usuario se ha actualizado correctamente",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Usuario eliminado",
        description: "El usuario se ha eliminado correctamente",
      });
    },
  });

  const handleSubmit = (data: z.infer<typeof userSchema>) => {
    if (editingId !== null) {
      const { password, ...rest } = data;
      // Solo enviar password si se ha modificado
      const updateData = password ? data : rest;
      updateMutation.mutate({ id: editingId, data: updateData });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    form.reset({
      username: user.username,
      password: "", // No mostramos la contraseña actual
      role: user.role,
      departmentId: user.departmentId || null,
      profileId: user.profileId || null,
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    form.reset({
      username: "",
      password: "",
      role: "member",
      departmentId: null,
      profileId: null,
    });
  };

  const getDepartmentName = (departmentId: number | null) => {
    if (!departmentId) return "No asignado";
    const department = departments.find((d: any) => d.id === departmentId);
    return department ? department.name : "No asignado";
  };

  const getProfileName = (profileId: number | null) => {
    if (!profileId) return "No asignado";
    const profile = profiles.find((p: any) => p.id === profileId);
    return profile ? profile.name : "No asignado";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de usuario</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{editingId ? "Nueva contraseña (opcional)" : "Contraseña"}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <Select 
                      value={field.value?.toString() || ""} 
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No asignado</SelectItem>
                        {departments.map((dept: any) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profileId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil</FormLabel>
                    <Select 
                      value={field.value?.toString() || ""} 
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar perfil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No asignado</SelectItem>
                        {profiles.map((profile: any) => (
                          <SelectItem key={profile.id} value={profile.id.toString()}>
                            {profile.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingId ? (
                    "Actualizar"
                  ) : (
                    "Crear"
                  )}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Form>

          <div className="rounded-md border">
            <div className="p-4">
              <div className="grid grid-cols-6 gap-4 font-medium">
                <div>Usuario</div>
                <div>Rol</div>
                <div>Departamento</div>
                <div>Perfil</div>
                <div className="col-span-2">Acciones</div>
              </div>
            </div>
            <div className="divide-y">
              {isLoadingUsers ? (
                <div className="p-4 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <div className="p-4 text-center">No hay usuarios registrados</div>
              ) : (
                users.map((user: any) => (
                  <div key={user.id} className="grid grid-cols-6 gap-4 p-4">
                    <div>{user.username}</div>
                    <div>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
                    <div>{getDepartmentName(user.departmentId)}</div>
                    <div>{getProfileName(user.profileId)}</div>
                    <div className="col-span-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(user)}
                        disabled={editingId === user.id}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(user.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="h-4 w-4" />
                        )}
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
