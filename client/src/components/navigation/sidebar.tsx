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
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  BarChart2,
  Settings,
  LogOut,
  ChevronDown,
  KanbanSquare,
  GanttChartSquare,
  Building2, // Added
  UserCircle // Added
} from "lucide-react";

interface NavigationSidebarProps {
  projects: Project[];
  onViewChange: (view: 'kanban' | 'gantt' | 'projects' | 'departments' | 'profiles' | null) => void; // Added 'departments' and 'profiles'
}

export default function Sidebar({ projects, onViewChange }: NavigationSidebarProps) {
  const { user, logoutMutation, setView } = useAuth(); // Added setView
  const { selectedProject, setSelectedProject } = useProjectStore();

  return (
    <div className="w-64 border-r bg-card text-card-foreground">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Project Management</h2>
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
              {user?.role === 'admin' && (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => {
                      setSelectedProject(null);
                      onViewChange(null);
                    }}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Usuarios
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => onViewChange('departments')} //Simplified
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    Departamentos
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm"
                    onClick={() => onViewChange('profiles')} //Simplified
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    Perfiles
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
                onClick={() => {
                  setSelectedProject(null);
                  onViewChange('projects');
                }}
              >
                <FolderKanban className="mr-2 h-4 w-4" />
                Projects
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                Reports
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>

          <div className="py-2">
            <h3 className="mb-2 px-2 text-sm font-semibold">Projects</h3>
            <div className="space-y-1">
              {projects.map((project) => (
                <DropdownMenu key={project.id}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={selectedProject?.id === project.id ? "secondary" : "ghost"}
                      className="w-full justify-between"
                      size="sm"
                    >
                      {project.name}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => {
                      setSelectedProject(project);
                      onViewChange('kanban');
                    }}>
                      <KanbanSquare className="mr-2 h-4 w-4" />
                      Kanban Board
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSelectedProject(project);
                      onViewChange('gantt');
                    }}>
                      <GanttChartSquare className="mr-2 h-4 w-4" />
                      Gantt Chart
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="absolute bottom-0 w-full p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          size="sm"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
import { cn } from "@/lib/utils";
import { Project } from "@shared/schema";
import { useRouter } from "@tanstack/react-router";
import React from "react";
import {
  HomeIcon,
  LayoutPanelLeft,
  ClipboardList,
  UsersRound,
  Building2,
  Layout,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NavigationSidebar({ projects, onViewChange }: NavigationSidebarProps) {
  const { selectedProject, setSelectedProject } = useProjectStore();
  const { user, logout } = useAuth();
  const navigate = useRouter();

  const handleProjectSelect = (project: Project | null) => {
    setSelectedProject(project);
    if (project) {
      onViewChange('kanban');
    } else {
      onViewChange(null);
    }
  };

  return (
    <div className="pb-12 w-64 bg-card border-r">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold tracking-tight">
              Project Manager
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem 
                  onClick={() => {
                    logout();
                    navigate.navigate({ to: "/" });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <p className="text-sm font-medium">{user?.username}</p>
            </div>
            <div>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => window.location.reload()}
              >
                <HomeIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="px-3 py-2">
          <h3 className="mb-2 px-4 text-sm font-semibold tracking-tight">
            Management
          </h3>
          <div className="space-y-1">
            <Button
              variant={!selectedProject && onViewChange === null ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                handleProjectSelect(null);
                onViewChange('projects');
              }}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Projects
            </Button>
            {user?.role === 'admin' && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    handleProjectSelect(null);
                    onViewChange('users');
                  }}
                >
                  <UsersRound className="mr-2 h-4 w-4" />
                  Users
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    handleProjectSelect(null);
                    onViewChange('departments');
                  }}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Departments
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    handleProjectSelect(null);
                    onViewChange('profiles');
                  }}
                >
                  <Layout className="mr-2 h-4 w-4" />
                  Profiles
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="py-2">
          <h3 className="relative px-7 text-sm font-semibold tracking-tight">
            Projects
          </h3>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1 p-2">
              {projects?.length === 0 ? (
                <div className="text-xs text-center py-4 text-muted-foreground">
                  No projects available
                </div>
              ) : (
                projects?.map((project) => (
                  <div key={project.id} className="mb-4">
                    <div 
                      className="flex justify-between items-center px-4 py-1 text-sm font-medium cursor-pointer"
                      onClick={() => handleProjectSelect(project)}
                    >
                      <span className={cn(
                        selectedProject?.id === project.id ? "text-primary" : "text-foreground"
                      )}>
                        {project.name}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                    {selectedProject?.id === project.id && (
                      <div className="ml-4 mt-1 space-y-1">
                        <Button
                          variant={onViewChange === 'kanban' ? "secondary" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => onViewChange('kanban')}
                        >
                          <LayoutPanelLeft className="mr-2 h-4 w-4" />
                          Kanban
                        </Button>
                        <Button
                          variant={onViewChange === 'gantt' ? "secondary" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => onViewChange('gantt')}
                        >
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Gantt
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}