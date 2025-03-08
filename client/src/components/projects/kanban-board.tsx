
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "../../lib/queryClient";

// Define la estructura de una tarea
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'todo_today' | 'in_progress' | 'done';
  assigneeId?: number;
  assigneeName?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

// Define la estructura de una columna
interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface KanbanData {
  columns: Record<string, Column>;
  columnOrder: string[];
}

// Esquema de validación para la creación de tareas
const taskSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(100, "El título no puede exceder 100 caracteres"),
  description: z.string().max(200, "La descripción no puede exceder 200 caracteres"),
  status: z.enum(["backlog", "todo_today", "in_progress", "done"]),
  assigneeId: z.number().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function KanbanBoard({ projectId }: { projectId: number }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [kanbanData, setKanbanData] = useState<KanbanData>({
    columns: {
      'backlog': {
        id: 'backlog',
        title: 'Backlog',
        tasks: [],
      },
      'todo_today': {
        id: 'todo_today',
        title: 'To Do Today',
        tasks: [],
      },
      'in_progress': {
        id: 'in_progress',
        title: 'In Progress',
        tasks: [],
      },
      'done': {
        id: 'done',
        title: 'Done',
        tasks: [],
      },
    },
    columnOrder: ['backlog', 'todo_today', 'in_progress', 'done'],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Configuración del formulario
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "backlog",
      priority: "medium",
    },
  });

  // Cargar usuarios y tareas al iniciar
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Cargar usuarios
        const usersResponse = await apiRequest('GET', '/api/users');
        const usersData = await usersResponse.json();
        setUsers(usersData);

        // Cargar tareas del proyecto
        const tasksResponse = await apiRequest('GET', `/api/projects/${projectId}/tasks`);
        const tasksData = await tasksResponse.json();

        // Organizar tareas en columnas
        const updatedColumns = { ...kanbanData.columns };
        
        // Limpiar tareas existentes
        Object.keys(updatedColumns).forEach(columnId => {
          updatedColumns[columnId].tasks = [];
        });

        // Distribuir tareas según su estado
        tasksData.forEach((task: Task) => {
          const column = task.status;
          if (updatedColumns[column]) {
            updatedColumns[column].tasks.push(task);
          } else {
            // Si el estado no coincide con ninguna columna, ponerlo en backlog
            updatedColumns['backlog'].tasks.push(task);
          }
        });

        setKanbanData({
          ...kanbanData,
          columns: updatedColumns
        });
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadData();
    }
  }, [projectId]);

  // Manejar el drag and drop
  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    // Si no hay destino o el destino es el mismo que el origen, no hacer nada
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Obtener columnas de origen y destino
    const sourceColumn = kanbanData.columns[source.droppableId];
    const destColumn = kanbanData.columns[destination.droppableId];
    
    // Encontrar la tarea que se está moviendo
    const task = sourceColumn.tasks.find(t => t.id === draggableId);
    if (!task) return;

    // Crear nuevos arrays de tareas para las columnas
    const newSourceTasks = Array.from(sourceColumn.tasks);
    newSourceTasks.splice(source.index, 1);
    
    const newDestTasks = Array.from(destColumn.tasks);
    newDestTasks.splice(destination.index, 0, {...task, status: destination.droppableId as any});

    // Actualizar el estado
    const newColumns = {
      ...kanbanData.columns,
      [sourceColumn.id]: {
        ...sourceColumn,
        tasks: newSourceTasks
      },
      [destColumn.id]: {
        ...destColumn,
        tasks: newDestTasks
      }
    };

    setKanbanData({
      ...kanbanData,
      columns: newColumns
    });

    // Enviar actualización al servidor
    try {
      await apiRequest('PUT', `/api/tasks/${task.id}`, {
        status: destination.droppableId
      });
    } catch (error) {
      console.error("Error al actualizar estado de la tarea:", error);
      // Revertir cambios en caso de error
      setKanbanData({
        ...kanbanData
      });
    }
  };

  // Manejar la creación de tareas
  const handleCreateTask = async (data: TaskFormValues) => {
    try {
      const response = await apiRequest('POST', `/api/projects/${projectId}/tasks`, {
        ...data,
        projectId
      });

      if (response.ok) {
        const newTask = await response.json();
        
        // Agregar la nueva tarea a la columna correspondiente
        const updatedColumns = { ...kanbanData.columns };
        updatedColumns[data.status].tasks.push(newTask);
        
        setKanbanData({
          ...kanbanData,
          columns: updatedColumns
        });
        
        // Cerrar el diálogo y resetear el formulario
        setIsDialogOpen(false);
        form.reset();
      }
    } catch (error) {
      console.error("Error al crear tarea:", error);
    }
  };

  // Renderizar el tablero Kanban
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Tablero Kanban</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nueva Tarea
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Tarea</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateTask)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título de la tarea" {...field} />
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
                          placeholder="Descripción de la tarea" 
                          maxLength={200}
                          {...field} 
                        />
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
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="backlog">Backlog</SelectItem>
                            <SelectItem value="todo_today">To Do Today</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridad</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona prioridad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Baja</SelectItem>
                            <SelectItem value="medium">Media</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
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
                    name="assigneeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asignado a</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona usuario" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.map(user => (
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
                  
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de vencimiento</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="date" 
                              {...field} 
                              value={field.value || ''} 
                            />
                            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="submit">Crear Tarea</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {kanbanData.columnOrder.map(columnId => {
            const column = kanbanData.columns[columnId];
            return (
              <Card key={columnId} className="min-h-96">
                <CardHeader className="bg-muted/50 pb-3">
                  <CardTitle className="text-md font-semibold">
                    {column.title} ({column.tasks.length})
                  </CardTitle>
                </CardHeader>
                <Droppable droppableId={columnId}>
                  {(provided) => (
                    <CardContent 
                      className="p-2"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable 
                          key={task.id} 
                          draggableId={task.id} 
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-2"
                            >
                              <Card className="hover:bg-muted/30 cursor-pointer">
                                <CardContent className="p-3 space-y-2">
                                  <div className="font-medium">{task.title}</div>
                                  <div className="text-sm text-muted-foreground line-clamp-2">
                                    {task.description}
                                  </div>
                                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <div>
                                      {task.assigneeName || "Sin asignar"}
                                    </div>
                                    <div className={`px-2 py-1 rounded-full ${
                                      task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {task.priority === 'high' ? 'Alta' : 
                                       task.priority === 'medium' ? 'Media' : 'Baja'}
                                    </div>
                                  </div>
                                  {task.dueDate && (
                                    <div className="text-xs flex items-center">
                                      <Calendar className="h-3 w-3 mr-1" /> 
                                      {format(new Date(task.dueDate), 'dd/MM/yyyy')}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </CardContent>
                  )}
                </Droppable>
              </Card>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
