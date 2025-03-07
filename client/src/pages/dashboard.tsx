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
    <div className="flex h-screen">
      <Sidebar projects={projects || []} onViewChange={setView} />

      <main className="flex-1 overflow-y-auto bg-background p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {selectedProject ? selectedProject.name : 'Project Management'}
          </h1>
          <div className="text-sm text-muted-foreground">
            Welcome, {user?.username}
          </div>
        </div>

        {!selectedProject && user?.role === 'admin' && view === 'dashboard' && (
          <AdminDashboard />
        )}
        {!selectedProject && user?.role === 'admin' && view === 'users' && (
          <UserManagement />
        )}
        {!selectedProject && user?.role === 'admin' && view === 'departments' && (
          <DepartmentManagement />
        )}
        {!selectedProject && user?.role === 'admin' && view === 'profiles' && (
          <ProfileManagement />
        )}

        {view === 'projects' && (
          <ProjectManagement />
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
import { useAuth } from "@/hooks/use-auth";
import NavigationSidebar from "@/components/navigation/sidebar";
import { useProjectStore } from "@/store/projects";
import { BreadcrumbNav } from "@/components/navigation/breadcrumb";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { projects } = useProjectStore();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex">
      <NavigationSidebar projects={projects} onViewChange={() => {}} />
      <div className="flex-1 p-6">
        <BreadcrumbNav />
        <h1 className="text-2xl font-bold">Welcome, {user?.username}!</h1>
        {/* Your dashboard content */}
      </div>
    </div>
  );
}
