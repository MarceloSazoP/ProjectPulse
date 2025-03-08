
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";
import { Department, Project } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Edit, Search, KanbanSquare, GanttChartSquare, Download, FileDown } from "lucide-react";
import { useState } from "react";
import ProjectStorage from "./project-storage";
import { BreadcrumbNav } from "@/components/navigation/breadcrumb";
import { useProjectStore } from "@/store/project";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface ProjectManagementProps {
  onViewChange?: (view: string) => void;
}

export default function ProjectManagement({ onViewChange }: ProjectManagementProps) {
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const itemsPerPage = 10;
  const { setSelectedProject } = useProjectStore();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/projects");
      return response.json();
    }
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/departments");
      return response.json();
    }
  });

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();

  // Schema de validación
  const projectSchema = z.object({
    name: z.string().min(1, { message: "Nombre del proyecto es requerido" }),
    description: z.string().min(1, { message: "Descripción es requerida" }),
    status: z.enum(["planning", "in_progress", "completed", "on_hold", "cancelled"]),
    departmentId: z.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    budget: z.number().optional(),
  });

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "planning",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      budget: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof projectSchema>) => {
      if (editingProject) {
        const response = await apiRequest("PUT", `/api/projects/${editingProject.id}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/projects", data);
        return response.json();
      }
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsDialogOpen(false);

      toast({
        title: editingProject ? "Proyecto actualizado" : "Proyecto creado",
        description: editingProject 
          ? `Se ha actualizado el proyecto ${newProject.name}` 
          : `Se ha creado el proyecto ${newProject.name}`,
      });

      if (uploadedFiles.length > 0 && newProject.id) {
        uploadProjectFiles(newProject.id);
      }

      // Seleccionar el nuevo proyecto
      setSelectedProject(newProject);

      // Opcionalmente, cambiar a la vista de kanban
      if (onViewChange) {
        onViewChange('kanban');
      }

      form.reset();
      setUploadedFiles([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar el proyecto",
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
      await apiRequest("POST", `/api/projects/${projectId}/files`, formData);
      toast({
        title: "Archivos subidos",
        description: "Los archivos se han subido correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron subir los archivos",
        variant: "destructive",
      });
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const response = await apiRequest("DELETE", `/api/projects/${projectId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Proyecto eliminado",
        description: "Se ha eliminado el proyecto correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el proyecto",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof projectSchema>) => {
    mutation.mutate(data);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    form.reset({
      name: project.name,
      description: project.description,
      status: project.status,
      departmentId: project.departmentId,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : undefined,
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : undefined,
      budget: project.budget,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProject(null);
    form.reset();
    setUploadedFiles([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Planificación</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En progreso</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completado</Badge>;
      case 'on_hold':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">En espera</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageCount = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Permite navegar al Kanban o Gantt del proyecto
  const navigateToProjectView = (project: Project, view: 'kanban' | 'gantt') => {
    setSelectedProject(project);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
  };

  return (
    <div className="space-y-6">
      <BreadcrumbNav items={[{ label: "Projects", href: "/projects" }]} />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Proyectos</h2>
          <p className="text-muted-foreground">
            Crea y administra tus proyectos desde aquí.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingProject(null);
              form.reset({
                name: "",
                description: "",
                status: "planning",
                startDate: new Date().toISOString().split('T')[0],
                endDate: "",
                budget: 0,
              });
            }}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Proyecto</FormLabel>
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="planning">Planificación</SelectItem>
                            <SelectItem value="in_progress">En Progreso</SelectItem>
                            <SelectItem value="completed">Completado</SelectItem>
                            <SelectItem value="on_hold">En Espera</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
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
                          onValueChange={(value) => field.onChange(Number(value))} 
                          defaultValue={field.value?.toString()}
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un departamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((department) => (
                              <SelectItem key={department.id} value={department.id.toString()}>
                                {department.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de Inicio</FormLabel>
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
                        <FormLabel>Fecha de Finalización</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Presupuesto</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">Archivos del Proyecto</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Solo se acepta un archivo comprimido (.zip o .rar) por proyecto
                  </p>
                  {editingProject ? (
                    <ProjectStorage
                      projectId={editingProject.id}
                      existingFiles={editingProject.files || []}
                      onFilesChange={handleFilesChange}
                      key={`file-storage-${editingProject.id}-${JSON.stringify(editingProject.files)}`}
                    />
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Input
                        type="file"
                        accept=".zip,.rar"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setUploadedFiles(Array.from(e.target.files));
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingProject ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center mb-4">
        <Search className="h-4 w-4 mr-2 text-muted-foreground" />
        <Input
          placeholder="Buscar proyectos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : paginatedProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No hay proyectos que mostrar
                </TableCell>
              </TableRow>
            ) : (
              paginatedProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.description}</TableCell>
                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                  <TableCell>
                    {project.departmentId
                      ? departments.find(d => d.id === project.departmentId)?.name || 'Departamento no encontrado'
                      : 'Sin departamento'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigateToProjectView(project, 'kanban')}
                        title="Ver tablero Kanban"
                      >
                        <KanbanSquare className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigateToProjectView(project, 'gantt')}
                        title="Ver gráfico Gantt"
                      >
                        <GanttChartSquare className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditProject(project)}
                        title="Editar proyecto"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Descargar archivos"
                        disabled={!project.files || project.files.length === 0}
                        onClick={async () => {
                          if (project.files && project.files.length > 0) {
                            // Implementar descarga
                            window.open(`/api/projects/${project.id}/files/download`, '_blank');
                          }
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {pageCount > 1 && (
        <div className="flex justify-center mt-4">
          <nav className="inline-flex">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <div className="flex items-center mx-2">
              Página {currentPage} de {pageCount}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount))}
              disabled={currentPage === pageCount}
            >
              Siguiente
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}
