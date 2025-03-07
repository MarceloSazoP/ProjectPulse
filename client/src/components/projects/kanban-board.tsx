import { useQuery, useMutation } from "@tanstack/react-query";
import { Task, InsertTask } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectStore } from "@/store/projects";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useState } from "react";


interface KanbanBoardProps {
  projectId: number;
}

const TASK_STATUS = ["backlog", "todo", "todo_today", "in_progress", "end"] as const;
const STATUS_LABELS = {
  backlog: "Backlog",
  todo: "To Do",
  todo_today: "To Do Today",
  in_progress: "In Progress",
  end: "End"
};

const STATUS_COLORS = {
  backlog: "bg-slate-100 hover:bg-slate-200",
  todo: "bg-blue-50 hover:bg-blue-100",
  todo_today: "bg-yellow-50 hover:bg-yellow-100",
  in_progress: "bg-purple-50 hover:bg-purple-100",
  end: "bg-green-50 hover:bg-green-100"
};

const PRIORITY_COLORS = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700"
};

// Assuming insertTaskSchema is defined elsewhere and imported
//  This is a placeholder, replace with your actual schema
const insertTaskSchema = {} as any;


export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { toast } = useToast();
  const { setIsDraggingTask, setDraggedTask } = useProjectStore();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/projects", projectId, "tasks"],
  });

  const form = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "todo",
      priority: "medium",
      projectId,
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: InsertTask) => {
      const res = await apiRequest("POST", "/api/tasks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "tasks"] });
      toast({
        title: "Task created",
        description: "New task has been created successfully",
      });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/tasks/${taskId}/status`, {
        status,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "tasks"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragStart = (task: Task) => {
    setIsDraggingTask(true);
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setIsDraggingTask(false);
    setDraggedTask(null);
  };

  const handleDrop = (status: string, task: Task) => {
    if (task.status !== status) {
      updateTaskMutation.mutate({ taskId: task.id, status });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tasksByStatus = TASK_STATUS.reduce((acc, status) => {
    acc[status] = tasks.filter((task) => task.status === status) || [];
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Tasks</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTask ? "Edit Task" : "Create New Task"}
              </DialogTitle>
              <DialogDescription>
                {editingTask
                  ? "Update task details and status"
                  : "Add a new task to the project"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createTaskMutation.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Name</FormLabel>
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
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
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createTaskMutation.isPending}
                >
                  {createTaskMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingTask ? "Update Task" : "Create Task"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {TASK_STATUS.map((status) => (
          <div
            key={status}
            className="flex flex-col space-y-2"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const draggedTask = useProjectStore.getState().draggedTask;
              if (draggedTask) {
                handleDrop(status, draggedTask);
              }
            }}
          >
            <div className="text-sm font-medium text-muted-foreground px-2 flex justify-between items-center">
              <span>{STATUS_LABELS[status]}</span>
              <span className="bg-background rounded-full px-2 py-1 text-xs">
                {tasksByStatus[status].length}
              </span>
            </div>
            <div className={`rounded-lg p-2 min-h-[150px] ${STATUS_COLORS[status]}`}>
              {tasksByStatus[status].map((task) => (
                <Card
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  onDragEnd={handleDragEnd}
                  className="mb-2 cursor-move hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <div className="font-medium">{task.name}</div>
                        {task.description && (
                          <div className="text-sm text-muted-foreground">
                            {task.description}
                          </div>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </div>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}