
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const departmentSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
});

export default function DepartmentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await axios.get("/api/departments");
      return response.data;
    },
  });
  
  // Asegurarse que departments sea siempre un array
  const departments = Array.isArray(data) ? data : [];

  const form = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof departmentSchema>) => {
      const response = await axios.post("/api/departments", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      form.reset({
        name: "",
        description: "",
      });
      toast({
        title: "Departamento creado",
        description: "El departamento se ha creado correctamente",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof departmentSchema> }) => {
      const response = await axios.put(`/api/departments/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setEditingId(null);
      form.reset({
        name: "",
        description: "",
      });
      toast({
        title: "Departamento actualizado",
        description: "El departamento se ha actualizado correctamente",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`/api/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast({
        title: "Departamento eliminado",
        description: "El departamento se ha eliminado correctamente",
      });
    },
  });

  const handleSubmit = (data: z.infer<typeof departmentSchema>) => {
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (department: any) => {
    setEditingId(department.id);
    form.reset({
      name: department.name,
      description: department.description || "",
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este departamento?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    form.reset({
      name: "",
      description: "",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Departamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingId ? (
                    "Actualizar"
                  ) : (
                    "Crear"
                  )}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Form>

          <div className="rounded-md border">
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4 font-medium">
                <div>Nombre</div>
                <div>Descripción</div>
                <div>Acciones</div>
              </div>
            </div>
            <div className="divide-y">
              {isLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </div>
              ) : departments.length === 0 ? (
                <div className="p-4 text-center">No hay departamentos registrados</div>
              ) : (
                departments.map((dept: any) => (
                  <div key={dept.id} className="grid grid-cols-3 gap-4 p-4">
                    <div>{dept.name}</div>
                    <div>{dept.description || "—"}</div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(dept)}
                        disabled={editingId === dept.id}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(dept.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="h-4 w-4" />
                        )}
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
