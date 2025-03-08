
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p>
          Bienvenido a tu panel de control. Aquí podrás gestionar todos tus proyectos y tareas.
        </p>
        
        {/* Aquí irá el contenido dinámico del dashboard */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">Proyectos Activos</h3>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">Tareas Pendientes</h3>
            <p className="text-2xl font-bold">24</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">Equipo</h3>
            <p className="text-2xl font-bold">8</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
