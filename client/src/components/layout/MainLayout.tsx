
import React from "react";
import { Sidebar } from "@/components/navigation/sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Gestor de Proyectos</h1>
          <div className="flex items-center gap-4">
            {/* Aquí puedes agregar iconos de notificaciones, perfil, etc. */}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Gestor de Proyectos. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
