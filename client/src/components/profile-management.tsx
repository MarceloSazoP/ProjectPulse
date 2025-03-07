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
                        value={field.value || []}
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
import { useQuery, useMutation } from "@tanstack/react-query";
import { Profile, Permission, InsertProfile } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProfileSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  CheckboxGroup,
  Checkbox,
} from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UserProfileManagement() {
  const { toast } = useToast();
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["/api/profiles"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/profiles");
      return response.json();
    }
  });

  const form = useForm<InsertProfile>({
    resolver: zodResolver(insertProfileSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  const permissions: Permission[] = [
    "viewProjects",
    "editProjects", 
    "deleteProjects",
    "viewTasks",
    "editTasks",
    "deleteTasks",
    "viewUsers",
    "editUsers",
    "viewReports"
  ];

  const createProfileMutation = useMutation({
    mutationFn: async (data: InsertProfile) => {
      const res = await apiRequest("POST", "/api/profiles", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({
        title: "Perfil creado",
        description: "El perfil ha sido creado exitosamente",
      });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear el perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Profile> }) => {
      const res = await apiRequest("PUT", `/api/profiles/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({
        title: "Perfil actualizado",
        description: "El perfil ha sido actualizado exitosamente",
      });
      setEditingProfile(null);
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar el perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/profiles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({
        title: "Perfil eliminado",
        description: "El perfil ha sido eliminado exitosamente",
      });
      setProfileToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar el perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const startEdit = (profile: Profile) => {
    setEditingProfile(profile);
    form.reset({
      name: profile.name,
      description: profile.description,
      permissions: profile.permissions,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingProfile(null);
    form.reset({
      name: "",
      description: "",
      permissions: [],
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Perfiles</h2>
          <p className="text-muted-foreground">
            Administra los perfiles de usuarios y sus permisos
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Añadir Perfil
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Permisos</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No hay perfiles disponibles
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.name}</TableCell>
                  <TableCell>{profile.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {profile.permissions.length === 0 ? (
                        <span className="text-muted-foreground text-xs">Sin permisos</span>
                      ) : (
                        profile.permissions.map((permission) => (
                          <div key={permission} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded">
                            {permission}
                          </div>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(profile)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setProfileToDelete(profile)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog para crear/editar perfil */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProfile ? "Editar Perfil" : "Crear Nuevo Perfil"}
            </DialogTitle>
            <DialogDescription>
              {editingProfile
                ? "Actualiza la información y permisos del perfil"
                : "Añade un nuevo perfil al sistema"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                editingProfile
                  ? updateProfileMutation.mutate({ id: editingProfile.id, data })
                  : createProfileMutation.mutate(data)
              )}
              className="space-y-4"
            >
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
                      <Textarea rows={3} {...field} />
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
                        value={field.value || []}
                        onValueChange={field.onChange}
                        className="grid grid-cols-2 gap-2 mt-2"
                      >
                        {permissions.map((permission) => (
                          <Checkbox
                            key={permission}
                            value={permission}
                            label={permission}
                          />
                        ))}
                      </CheckboxGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
              >
                {(createProfileMutation.isPending || updateProfileMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingProfile ? "Actualizar Perfil" : "Crear Perfil"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={!!profileToDelete} onOpenChange={() => setProfileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este
              perfil y sus permisos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => profileToDelete && deleteProfileMutation.mutate(profileToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProfileMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}