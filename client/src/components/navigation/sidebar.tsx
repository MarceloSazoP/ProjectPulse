import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Project } from "@shared/schema";
import { useProjectStore } from "@/store/projects";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Calendar, 
  Settings,
  LogOut 
} from "lucide-react";

interface SidebarProps {
  projects: Project[];
}

export default function Sidebar({ projects }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
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
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  size="sm"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Users
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <FolderKanban className="mr-2 h-4 w-4" />
                Projects
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                size="sm"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
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
                <Button
                  key={project.id}
                  variant={selectedProject?.id === project.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  size="sm"
                  onClick={() => setSelectedProject(project)}
                >
                  {project.name}
                </Button>
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
