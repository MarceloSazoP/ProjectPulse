import React from "react";
// import { useRouter } from "@tanstack/react-router"; //Removed
import {
  HomeIcon,
  Layout,
  LogOut,
  Settings,
  UserCircle,
  KanbanSquare,
  GanttChartSquare,
  Building2,
  LayoutDashboard,
  Users,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Project } from "@shared/schema";
import { useProjectStore } from "@/store/projects";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationSidebarProps {
  projects: Project[];
  onViewChange: (view: string | null) => void;
}

const views = [
  {
    name: "Kanban Board",
    icon: KanbanSquare,
    view: "kanban",
  },
  {
    name: "Gantt Chart",
    icon: GanttChartSquare,
    view: "gantt",
  },
];

export default function NavigationSidebar({
  projects,
  onViewChange,
}: NavigationSidebarProps) {
  const { selectedProject, setSelectedProject } = useProjectStore();
  const { user, logoutMutation } = useAuth();
  // const navigate = useRouter(); //Removed

  const handleProjectSelect = (project: Project | null) => {
    setSelectedProject(project);
  };

  return (
    <div className="w-64 border-r bg-background/95 backdrop-blur h-screen supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center gap-2 font-semibold">
          <Layout className="h-6 w-6" />
          <span className="text-lg">ProjectPulse</span>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-theme(spacing.24))]">
        <div className="space-y-4 p-4">
          <div className="py-2">
            <h3 className="mb-2 px-2 text-sm font-semibold">Navigation</h3>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              {user?.role === "admin" && (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => {
                      setSelectedProject(null);
                      onViewChange("dashboard");
                    }}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => {
                      setSelectedProject(null);
                      onViewChange("users");
                    }}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Usuarios
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => onViewChange("departments")}
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Departamentos
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => onViewChange("profiles")}
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    Perfiles
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => onViewChange("projects")}
                  >
                    <KanbanSquare className="mr-2 h-4 w-4" />
                    Proyectos
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="py-2">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-semibold">Projects</h3>
            </div>
            <div className="mt-2 space-y-1">
              {projects.map((project) => (
                <DropdownMenu key={project.id}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={
                        selectedProject?.id === project.id
                          ? "secondary"
                          : "ghost"
                      }
                      className="w-full justify-between pr-2"
                      size="sm"
                      onClick={() => handleProjectSelect(project)}
                    >
                      <div className="flex items-center">
                        <HomeIcon className="mr-2 h-4 w-4" />
                        <span className="truncate">{project.name}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-60">
                    {views.map((view) => (
                      <DropdownMenuItem
                        key={view.view}
                        onClick={() => onViewChange(view.view)}
                      >
                        <view.icon className="mr-2 h-4 w-4" />
                        {view.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="mt-auto p-4">
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 p-0">
                <UserCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-0.5 leading-none">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.role}</p>
                </div>
              </div>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => onViewChange("profiles")}
                >
                  Settings
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  logoutMutation.mutate();
                  // navigate.navigate({ to: "/" }); //Removed
                  window.location.href = "/"; //Added for redirection
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}