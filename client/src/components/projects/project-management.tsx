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
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Download, Edit, Search, KanbanSquare, GanttChartSquare } from "lucide-react";
import { useState } from "react";
import KanbanBoard from "./kanban-board";
import GanttChart from "./gantt-chart";

export default function ProjectManagement() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedView, setSelectedView] = useState<{ type: 'kanban' | 'gantt' | null, projectId: number | null }>({ type: null, projectId: null });
  const itemsPerPage = 10;

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      status: "planning",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };
      const res = await apiRequest("POST", "/api/projects", formattedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project created",
        description: "New project has been created successfully",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Project> }) => {
      const formattedData = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      };
      const res = await apiRequest("PUT", `/api/projects/${id}`, formattedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project updated",
        description: "Project has been updated successfully",
      });
      setEditingProject(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(search.toLowerCase()) ||
    project.description?.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedProjects = filteredProjects.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Projects</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Edit Project" : "Create New Project"}
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
                      <FormLabel>Name</FormLabel>
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          value={value instanceof Date ? value.toISOString().split('T')[0] : ''} 
                          onChange={(e) => onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          value={value instanceof Date ? value.toISOString().split('T')[0] : ''} 
                          onChange={(e) => onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                >
                  {(createProjectMutation.isPending || updateProjectMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingProject ? "Update Project" : "Create Project"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Dialog open={selectedView.type !== null} onOpenChange={() => setSelectedView({ type: null, projectId: null })}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedView.type === 'kanban' ? 'Kanban Board' : 'Gantt Chart'}
            </DialogTitle>
          </DialogHeader>
          {selectedView.type === 'kanban' && selectedView.projectId && (
            <KanbanBoard projectId={selectedView.projectId} />
          )}
          {selectedView.type === 'gantt' && selectedView.projectId && (
            <GanttChart projectId={selectedView.projectId} />
          )}
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.description}</TableCell>
                <TableCell>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </TableCell>
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
                      onClick={() => {
                        setEditingProject(project);
                        form.reset(project);
                      }}
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        toast({
                          title: "Download started",
                          description: "Project documentation is being downloaded",
                        });
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}