import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/navigation/sidebar";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import KanbanBoard from "@/components/projects/kanban-board";
import GanttChart from "@/components/projects/gantt-chart";
import { useProjectStore } from "@/store/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const selectedProject = useProjectStore((state) => state.selectedProject);

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar projects={projects || []} />
      
      <main className="flex-1 overflow-y-auto bg-background p-6">
        {selectedProject ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">{selectedProject.name}</h1>
              <div className="text-sm text-muted-foreground">
                Welcome, {user?.username}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kanban Board</CardTitle>
                </CardHeader>
                <CardContent>
                  <KanbanBoard projectId={selectedProject.id} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gantt Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <GanttChart projectId={selectedProject.id} />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a project from the sidebar to get started
          </div>
        )}
      </main>
    </div>
  );
}
