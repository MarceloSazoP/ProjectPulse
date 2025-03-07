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

interface SidebarProps {
  projects: Project[];
  onViewChange: (view: 'kanban' | 'gantt' | 'projects' | 'departments' | 'profiles' | null) => void; // Added 'departments' and 'profiles'
}

export default function Sidebar({ projects, onViewChange }: SidebarProps) {
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