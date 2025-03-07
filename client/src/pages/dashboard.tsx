import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/navigation/sidebar";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import KanbanBoard from "@/components/projects/kanban-board";
import GanttChart from "@/components/projects/gantt-chart";
import ProjectManagement from "@/components/projects/project-management";
import UserManagement from "@/components/users/user-management";
import DepartmentManagement from "@/components/department-management";
import ProfileManagement from "@/components/profile-management";
import AdminDashboard from "@/components/admin-dashboard";
import { useProjectStore } from "@/store/projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { BreadcrumbNav } from "@/components/navigation/breadcrumb";

export default function Dashboard() {
  const { user } = useAuth();
  const selectedProject = useProjectStore((state) => state.selectedProject);
  const [view, setView] = useState<'kanban' | 'gantt' | 'projects' | 'users' | 'departments' | 'profiles' | 'dashboard' | null>(null);

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
    <div className="min-h-screen flex">
      <Sidebar projects={projects || []} onViewChange={(v) => setView(v)} />
      <main className="flex-1 p-6">
        <BreadcrumbNav />
        <h1 className="text-2xl font-bold mb-6">Welcome, {user?.username}!</h1>

        {view === 'projects' && (
          <ProjectManagement />
        )}

        {view === 'users' && user?.role === 'admin' && (
          <UserManagement />
        )}

        {view === 'departments' && user?.role === 'admin' && (
          <DepartmentManagement />
        )}

        {view === 'profiles' && (
          <ProfileManagement />
        )}

        {view === 'dashboard' && user?.role === 'admin' && (
          <AdminDashboard />
        )}

        {selectedProject && view === 'kanban' && (
          <Card>
            <CardHeader>
              <CardTitle>Kanban Board</CardTitle>
            </CardHeader>
            <CardContent>
              <KanbanBoard projectId={selectedProject.id} />
            </CardContent>
          </Card>
        )}

        {selectedProject && view === 'gantt' && (
          <Card>
            <CardHeader>
              <CardTitle>Gantt Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <GanttChart projectId={selectedProject.id} />
            </CardContent>
          </Card>
        )}

        {selectedProject && !view && (
          <div className="text-center text-muted-foreground mt-8">
            Select Kanban Board or Gantt Chart from the project menu
          </div>
        )}

        {!selectedProject && !view && user?.role !== 'admin' && (
          <div className="text-center text-muted-foreground mt-8">
            Select a project from the sidebar to get started
          </div>
        )}
      </main>
    </div>
  );
}