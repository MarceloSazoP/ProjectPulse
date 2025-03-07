
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

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof userSchema>) => {
      const response = await axios.post("/api/register", data);
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
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: z.infer<typeof editUserSchema>;
    }) => {
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

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "member",
      departmentId: null,
      profileId: null,
    },
  });

  const onSubmit = (data: z.infer<typeof userSchema>) => {
    // Convert string IDs to numbers if they exist
    const formattedData = {
      ...data,
      departmentId: data.departmentId ? Number(data.departmentId) : null,
      profileId: data.profileId ? Number(data.profileId) : null,
    };

    if (editingId) {
      const { password, ...updateData } = formattedData;
      updateMutation.mutate({ id: editingId, data: updateData });
    } else {
      createMutation.mutate(formattedData);
    }
  };

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    form.reset({
      username: user.username,
      password: "", // Password field is cleared for security
      role: user.role,
      departmentId: user.departmentId,
      profileId: user.profileId,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    form.reset({
      username: "",
      password: "",
      role: "member",
      departmentId: null,
      profileId: null,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      deleteMutation.mutate(id);
    }
  };

  const getDepartmentName = (id: number | null) => {
    if (!id) return "No asignado";
    const department = departments.find((d: any) => d.id === id);
    return department ? department.name : "Desconocido";
  };

  const getProfileName = (id: number | null) => {
    if (!id) return "No asignado";
    const profile = profiles.find((p: any) => p.id === id);
    return profile ? profile.name : "Desconocido";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? "Editar Usuario" : "Crear Usuario"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              {!editingId && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un rol" />
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
                      onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Sin departamento</SelectItem>
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
                      onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un perfil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Sin perfil</SelectItem>
                        {profiles.map((profile: any) => (
                          <SelectItem
                            key={profile.id}
                            value={profile.id.toString()}
                          >
                            {profile.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingId ? "Actualizar" : "Crear"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No hay usuarios
            </p>
          ) : (
            <div className="space-y-4">
              {users.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-md"
                >
                  <div>
                    <h3 className="font-medium">{user.username}</h3>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mt-1">
                      <p><strong>Rol:</strong> {user.role}</p>
                      <p><strong>Departamento:</strong> {getDepartmentName(user.departmentId)}</p>
                      <p><strong>Perfil:</strong> {getProfileName(user.profileId)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user.id)}
                      disabled={user.username === "admin"} // Prevent deleting admin
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
