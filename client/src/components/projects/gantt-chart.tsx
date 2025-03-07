import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GanttChartProps {
  projectId: number;
}

export default function GanttChart({ projectId }: GanttChartProps) {
  const { toast } = useToast();

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/projects", projectId, "tasks"],
    onError: (error: Error) => {
      toast({
        title: "Failed to load tasks",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tasks?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No tasks found for this project
      </div>
    );
  }

  // Find date range for all tasks
  const dates = tasks.flatMap(task => [
    task.dueDate ? new Date(task.dueDate) : null
  ]).filter((date): date is Date => date !== null);

  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

  // Calculate total days for chart width
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Generate array of dates for header
  const dateRange = Array.from({ length: totalDays }, (_, i) => {
    const date = new Date(minDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <ScrollArea className="h-[400px] w-full">
      <div className="min-w-[800px]">
        {/* Timeline header */}
        <div className="flex border-b">
          <div className="w-48 shrink-0 p-2 font-medium">Task</div>
          <div className="flex-1 flex">
            {dateRange.map((date, i) => (
              <div
                key={i}
                className="w-8 text-center text-xs text-muted-foreground border-l"
              >
                {date.getDate()}
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="divide-y">
          {tasks.map((task) => {
            if (!task.dueDate) return null;

            const taskDate = new Date(task.dueDate);
            const dayOffset = Math.floor(
              (taskDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <div key={task.id} className="flex items-center">
                <div className="w-48 shrink-0 p-2">
                  <div className="font-medium truncate">{task.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {task.status}
                  </div>
                </div>
                <div className="flex-1 flex relative h-8">
                  <div
                    className={`absolute h-4 top-2 rounded ${
                      task.status === "done"
                        ? "bg-primary"
                        : task.status === "in_progress"
                        ? "bg-primary/60"
                        : "bg-primary/30"
                    }`}
                    style={{
                      left: `${dayOffset * 2}rem`,
                      width: "2rem",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
