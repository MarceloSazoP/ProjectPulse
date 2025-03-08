
import React from "react";
import { Link } from "wouter";
import { 
  Home, 
  Users, 
  PieChart, 
  Folder, 
  Settings, 
  LogOut, 
  KanbanSquare,
  GanttChartSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface Project {
  id: number;
  name: string;
  // otros campos de proyecto
}

interface NavigationSidebarProps {
  projects?: Project[];
  onViewChange?: (view: string | null) => void;
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

export function Sidebar() {
  const { user, logoutMutation } = useAuth();

  return (
    <aside className="border-r bg-sidebar w-64 overflow-y-auto h-full">
      <div className="flex flex-col p-4">
        <div className="mb-4">
          <Link href="/dashboard">
            <a className="flex items-center text-lg font-semibold">
              <span>Gestor de Proyectos</span>
            </a>
          </Link>
        </div>

        <nav className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-2">
              Principal
            </h3>
            <ul className="space-y-1">
              <li>
                <Link href="/dashboard">
                  <a className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                    <Home className="h-4 w-4 mr-3" />
                    <span>Dashboard</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/projects">
                  <a className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                    <Folder className="h-4 w-4 mr-3" />
                    <span>Proyectos</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/departments">
                  <a className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                    <PieChart className="h-4 w-4 mr-3" />
                    <span>Departamentos</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/users">
                  <a className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                    <Users className="h-4 w-4 mr-3" />
                    <span>Usuarios</span>
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-2">
              Configuración
            </h3>
            <ul className="space-y-1">
              <li>
                <Link href="/settings">
                  <a className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent">
                    <Settings className="h-4 w-4 mr-3" />
                    <span>Configuración</span>
                  </a>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  <span>Cerrar sesión</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}
