
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Profile, InsertProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProfileSchema } from "@shared/schema";
import { Loader2, UserPlus, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";

export function ProfileManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);

  const { data: profiles = [], isLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/profiles");
      return response.json();
    }
  });

  const permissionOptions = [
    { label: 'Ver proyectos', value: 'view_projects' },
    { label: 'Crear proyectos', value: 'create_projects' },
    { label: 'Editar proyectos', value: 'edit_projects' },
    { label: 'Eliminar proyectos', value: 'delete_projects' },
    { label: 'Ver tareas', value: 'view_tasks' },
    { label: 'Crear tareas', value: 'create_tasks' },
    { label: 'Editar tareas', value: 'edit_tasks' },
    { label: 'Eliminar tareas', value: 'delete_tasks' },
    { label: 'Ver usuarios', value: 'view_users' },
    { label: 'Crear usuarios', value: 'create_users' },
    { label: 'Editar usuarios', value: 'edit_users' },
    { label: 'Eliminar usuarios', value: 'delete_users' },
    { label: 'Ver departamentos', value: 'view_departments' },
    { label: 'Administrar departamentos', value: 'manage_departments' },
    { label: 'Ver perfiles', value: 'view_profiles' },
    { label: 'Administrar perfiles', value: 'manage_profiles' },
  ];

  const form = useForm<InsertProfile>({
    resolver: zodResolver(insertProfileSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

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
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el perfil",
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
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil",
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
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el perfil",
        variant: "destructive",
      });
    },
  });

  const openCreateDialog = () => {
    form.reset({
      name: "",
      description: "",
      permissions: [],
    });
    setEditingProfile(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (profile: Profile) => {
    setEditingProfile(profile);
    form.reset({
      name: profile.name,
      description: profile.description || "",
      permissions: profile.permissions || [],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (values: InsertProfile) => {
    if (editingProfile) {
      updateProfileMutation.mutate({ id: editingProfile.id, data: values });
    } else {
      createProfileMutation.mutate(values);
    }
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
            Administra los perfiles de usuario y sus permisos (Admin, Operador, Programador, etc.)
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo Perfil
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProfile ? "Editar Perfil" : "Crear Nuevo Perfil"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Admin, Operador, Programador..." {...field} />
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
                      <Textarea 
                        placeholder="Descripción del perfil y sus responsabilidades..."
                        {...field}
                        value={field.value || ""}
                      />
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
                      <MultiSelect
                        placeholder="Seleccione permisos..."
                        options={permissionOptions}
                        value={field.value?.map(value => ({
                          label: permissionOptions.find(option => option.value === value)?.label || value,
                          value
                        })) || []}
                        onChange={(selected) => {
                          field.onChange(selected.map(item => item.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                >
                  {(createProfileMutation.isPending || updateProfileMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingProfile ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!profileToDelete}
        onOpenChange={(isOpen) => !isOpen && setProfileToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el perfil
              {profileToDelete?.name && <strong> "{profileToDelete.name}"</strong>} y 
              podría afectar a los usuarios que lo tengan asignado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => profileToDelete && deleteProfileMutation.mutate(profileToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteProfileMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                  No hay perfiles disponibles. Cree uno nuevo para comenzar.
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.name}</TableCell>
                  <TableCell>{profile.description || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {profile.permissions && profile.permissions.length > 0 ? (
                        profile.permissions.slice(0, 3).map((permission, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {permissionOptions.find(opt => opt.value === permission)?.label || permission}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin permisos</span>
                      )}
                      {profile.permissions && profile.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{profile.permissions.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(profile)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
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
    </div>
  );
}

export default ProfileManagement;
