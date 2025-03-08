
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";

export default function Projects() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Proyectos</h2>
        <p>
          Gestiona todos tus proyectos desde aquí. Crea nuevos, edita existentes o archiva los completados.
        </p>
        
        <div className="rounded-lg border p-6">
          <h3 className="mb-4 text-xl font-medium">Lista de Proyectos</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded bg-muted p-3">
              <span>Proyecto de Marketing Digital</span>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Activo</span>
            </div>
            <div className="flex items-center justify-between rounded bg-muted p-3">
              <span>Desarrollo de Aplicación Web</span>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Activo</span>
            </div>
            <div className="flex items-center justify-between rounded bg-muted p-3">
              <span>Rediseño de Identidad Corporativa</span>
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">En pausa</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
