
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
import { Textarea } from "@/components/ui/textarea";
import { CheckboxGroup, CheckboxItem } from "@/components/ui/checkbox-group";
import { Loader2, Pencil, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const permissionOptions = [
  { id: "create_project", label: "Crear proyectos" },
  { id: "edit_project", label: "Editar proyectos" },
  { id: "delete_project", label: "Eliminar proyectos" },
  { id: "create_task", label: "Crear tareas" },
  { id: "edit_task", label: "Editar tareas" },
  { id: "delete_task", label: "Eliminar tareas" },
  { id: "assign_task", label: "Asignar tareas" },
  { id: "view_reports", label: "Ver reportes" },
  { id: "manage_users", label: "Gestionar usuarios" },
];

const profileSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "Selecciona al menos un permiso"),
});

export default function ProfileManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const response = await axios.get("/api/profiles");
      return response.data;
    },
  });

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      const response = await axios.post("/api/profiles", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      form.reset({
        name: "",
        description: "",
        permissions: [],
      });
      toast({
        title: "Perfil creado",
        description: "El perfil se ha creado correctamente",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof profileSchema> }) => {
      const response = await axios.put(`/api/profiles/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      setEditingId(null);
      form.reset({
        name: "",
        description: "",
        permissions: [],
      });
      toast({
        title: "Perfil actualizado",
        description: "El perfil se ha actualizado correctamente",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/profiles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast({
        title: "Perfil eliminado",
        description: "El perfil se ha eliminado correctamente",
      });
    },
  });

  const handleSubmit = (data: z.infer<typeof profileSchema>) => {
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (profile: any) => {
    setEditingId(profile.id);
    form.reset({
      name: profile.name,
      description: profile.description || "",
      permissions: profile.permissions || [],
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este perfil?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    form.reset({
      name: "",
      description: "",
      permissions: [],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Perfiles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permisos</FormLabel>
                    <FormControl>
                      <CheckboxGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-2 gap-2 mt-2"
                      >
                        {permissionOptions.map((option) => (
                          <CheckboxItem
                            key={option.id}
                            id={option.id}
                            label={option.label}
                            value={option.id}
                          />
                        ))}
                      </CheckboxGroup>
                    </FormControl>
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
              <div className="grid grid-cols-4 gap-4 font-medium">
                <div>Nombre</div>
                <div>Descripción</div>
                <div>Permisos</div>
                <div>Acciones</div>
              </div>
            </div>
            <div className="divide-y">
              {isLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </div>
              ) : profiles.length === 0 ? (
                <div className="p-4 text-center">No hay perfiles registrados</div>
              ) : (
                profiles.map((profile: any) => (
                  <div key={profile.id} className="grid grid-cols-4 gap-4 p-4">
                    <div>{profile.name}</div>
                    <div>{profile.description || "—"}</div>
                    <div>
                      {profile.permissions && profile.permissions.length > 0
                        ? profile.permissions.length + " permisos"
                        : "Sin permisos"}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(profile)}
                        disabled={editingId === profile.id}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(profile.id)}
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
