import { useQuery, useMutation } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { useProjectStore } from "@/store/projects";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KanbanBoardProps {
  projectId: number;
}

const TASK_STATUS = ["todo", "in_progress", "done"] as const;
const STATUS_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { toast } = useToast();
  const { setIsDraggingTask, setDraggedTask } = useProjectStore();

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/projects", projectId, "tasks"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (variables: { taskId: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/tasks/${variables.taskId}/status`, {
        status: variables.status,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "tasks"] });
      toast({
        title: "Task updated",
        description: "Task status has been updated successfully",
      });
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
    acc[status] = tasks?.filter((task) => task.status === status) || [];
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="text-sm font-medium text-muted-foreground px-2">
            {STATUS_LABELS[status]} ({tasksByStatus[status].length})
          </div>
          <div className="bg-muted/50 p-2 rounded-lg min-h-[150px]">
            {tasksByStatus[status].map((task) => (
              <Card
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(task)}
                onDragEnd={handleDragEnd}
                className="mb-2 cursor-move hover:bg-accent"
              >
                <CardContent className="p-3">
                  <div className="font-medium">{task.name}</div>
                  {task.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </div>
                  )}
                  {task.dueDate && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
