
import { useQuery, useMutation } from "@tanstack/react-query";
import { Project, InsertProject } from "@shared/schema";
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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Search, KanbanSquare, GanttChartSquare } from "lucide-react";
import { useState } from "react";
import ProjectStorage from "./project-storage";

export default function ProjectManagement() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedView, setSelectedView] = useState<{ type: 'kanban' | 'gantt' | null, projectId: number | null }>({ type: null, projectId: null });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const itemsPerPage = 10;

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/projects");
      return response.json();
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      return response.json();
    }
  });

  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      status: "planning",
      budget: 0,
      managerId: null,
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return res.json();
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Proyecto creado",
        description: "El proyecto ha sido creado exitosamente",
      });
      
      // Upload files if any
      if (uploadedFiles.length > 0 && newProject.id) {
        uploadProjectFiles(newProject.id);
      }
      
      form.reset();
      setUploadedFiles([]);
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear el proyecto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Project> }) => {
      const res = await apiRequest("PUT", `/api/projects/${id}`, data);
      return res.json();
    },
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Proyecto actualizado",
        description: "El proyecto ha sido actualizado exitosamente",
      });
      
      // Upload files if any
      if (uploadedFiles.length > 0 && updatedProject.id) {
        uploadProjectFiles(updatedProject.id);
      }
      
      setEditingProject(null);
      setUploadedFiles([]);
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar el proyecto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadProjectFiles = async (projectId: number) => {
    if (uploadedFiles.length === 0) return;
    
    const formData = new FormData();
    uploadedFiles.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error uploading files');
      }
      
      toast({
        title: "Archivos subidos",
        description: "Los archivos han sido subidos exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error al subir archivos",
        description: "No se pudieron subir los archivos",
        variant: "destructive",
      });
    }
  };

  const startEdit = (project: Project) => {
    setEditingProject(project);
    form.reset({
      ...project,
      startDate: new Date(project.startDate).toISOString().substring(0, 10),
      endDate: new Date(project.endDate).toISOString().substring(0, 10),
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingProject(null);
    form.reset({
      name: "",
      description: "",
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      status: "planning",
      budget: 0,
      managerId: null,
    });
    setUploadedFiles([]);
    setIsDialogOpen(true);
  };

  const handleFilesChange = (files: File[] | string[]) => {
    if (files.length > 0 && files[0] instanceof File) {
      setUploadedFiles(files as File[]);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(search.toLowerCase()) ||
    project.description?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedProjects = filteredProjects.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string, color: string }> = {
      'planning': { label: 'Planificación', color: 'bg-blue-100 text-blue-800' },
      'active': { label: 'Activo', color: 'bg-green-100 text-green-800' },
      'completed': { label: 'Completado', color: 'bg-gray-100 text-gray-800' },
      'on_hold': { label: 'En espera', color: 'bg-yellow-100 text-yellow-800' }
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge variant="outline" className={`${config.color}`}>
        {config.label}
      </Badge>
    );
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
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Proyectos</h2>
          <p className="text-muted-foreground">
            Administra los proyectos de la organización
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar proyectos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Fecha Fin</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No hay proyectos disponibles
                </TableCell>
              </TableRow>
            ) : (
              paginatedProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.description}</TableCell>
                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                  <TableCell>
                    {new Date(project.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(project.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedView({ type: 'kanban', projectId: project.id })}
                      >
                        <KanbanSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedView({ type: 'gantt', projectId: project.id })}
                      >
                        <GanttChartSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <div className="text-sm">
            Página {page} de {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                editingProject
                  ? updateProjectMutation.mutate({ id: editingProject.id, data })
                  : createProjectMutation.mutate(data)
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
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de inicio</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de finalización</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="planning">Planificación</SelectItem>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
                          <SelectItem value="on_hold">En espera</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Presupuesto</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="managerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      defaultValue={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar responsable" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Ninguno</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Componente para subir archivos */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Archivos del proyecto</h3>
                {editingProject ? (
                  <ProjectStorage 
                    projectId={editingProject.id} 
                    existingFiles={editingProject.files || []}
                    onFilesChange={handleFilesChange}
                  />
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="file"
                      multiple
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const files = Array.from(e.target.files);
                          setUploadedFiles(files);
                        }
                      }}
                    />
                    {uploadedFiles.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {uploadedFiles.length} archivo(s) seleccionado(s)
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
              >
                {(createProjectMutation.isPending || updateProjectMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingProject ? "Actualizar Proyecto" : "Crear Proyecto"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
