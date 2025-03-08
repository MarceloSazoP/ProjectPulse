import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Button } from '../ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { apiRequest } from '../../lib/api-request';
import { useToast } from '../../hooks/use-toast';

// Definir interfaces para tipado
interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assigneeId?: number;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface KanbanData {
  columns: Record<string, Column>;
  columnOrder: string[];
}

export default function KanbanBoard({ projectId }: { projectId: number }) {
  const { toast } = useToast();
  const [kanbanData, setKanbanData] = useState<KanbanData>({
    columns: {
      'col-1': {
        id: 'col-1',
        title: 'Por hacer',
        tasks: [],
      },
      'col-2': {
        id: 'col-2',
        title: 'En progreso',
        tasks: [],
      },
      'col-3': {
        id: 'col-3',
        title: 'Completado',
        tasks: [],
      },
    },
    columnOrder: ['col-1', 'col-2', 'col-3'],
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);

  useEffect(() => {
    // Cargar tareas del proyecto
    const fetchTasks = async () => {
      try {
        const response = await apiRequest('GET', `/api/projects/${projectId}/tasks`);
        const tasks = await response.json();

        // Organizar tareas en columnas según su estado
        const updatedColumns = { ...kanbanData.columns };

        // Resetear las tareas en todas las columnas
        Object.keys(updatedColumns).forEach(columnId => {
          updatedColumns[columnId].tasks = [];
        });

        // Distribuir tareas en las columnas correspondientes
        tasks.forEach((task: Task) => {
          if (task.status === 'not_started') {
            updatedColumns['col-1'].tasks.push(task);
          } else if (task.status === 'in_progress') {
            updatedColumns['col-2'].tasks.push(task);
          } else if (task.status === 'completed') {
            updatedColumns['col-3'].tasks.push(task);
          }
        });

        setKanbanData({
          ...kanbanData,
          columns: updatedColumns
        });
      } catch (error) {
        console.error('Error al cargar tareas:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las tareas del proyecto',
          variant: 'destructive',
        });
      }
    };

    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    // Si no hay destino o el destino es el mismo que el origen, no hacer nada
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Encontrar la columna de origen y destino
    const sourceColumn = kanbanData.columns[source.droppableId];
    const destColumn = kanbanData.columns[destination.droppableId];

    // Encontrar la tarea que se está moviendo
    const task = sourceColumn.tasks[source.index];

    // Crear copias para actualizar el estado
    const newSourceTasks = Array.from(sourceColumn.tasks);
    newSourceTasks.splice(source.index, 1);

    const newDestTasks = Array.from(destColumn.tasks);
    newDestTasks.splice(destination.index, 0, task);

    // Actualizar el estado local
    const newColumns = {
      ...kanbanData.columns,
      [sourceColumn.id]: {
        ...sourceColumn,
        tasks: newSourceTasks
      },
      [destColumn.id]: {
        ...destColumn,
        tasks: newDestTasks
      }
    };

    setKanbanData({
      ...kanbanData,
      columns: newColumns
    });

    // Determinar el nuevo estado de la tarea según la columna de destino
    let newStatus;
    if (destination.droppableId === 'col-1') newStatus = 'not_started';
    else if (destination.droppableId === 'col-2') newStatus = 'in_progress';
    else if (destination.droppableId === 'col-3') newStatus = 'completed';

    // Actualizar en la base de datos
    try {
      await apiRequest('PATCH', `/api/projects/${projectId}/tasks/${task.id}`, {
        status: newStatus
      });
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de la tarea',
        variant: 'destructive',
      });
    }
  };

  const handleAddTask = async (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    // Determinar el estado según la columna
    let status;
    if (columnId === 'col-1') status = 'not_started';
    else if (columnId === 'col-2') status = 'in_progress';
    else status = 'completed';

    try {
      const response = await apiRequest('POST', `/api/projects/${projectId}/tasks`, {
        title: newTaskTitle,
        description: '',
        status,
        priority: 'medium'
      });

      if (response.ok) {
        const newTask = await response.json();

        // Actualizar el estado local
        const column = kanbanData.columns[columnId];
        const updatedColumn = {
          ...column,
          tasks: [...column.tasks, newTask]
        };

        setKanbanData({
          ...kanbanData,
          columns: {
            ...kanbanData.columns,
            [columnId]: updatedColumn
          }
        });

        // Limpiar el campo de entrada
        setNewTaskTitle('');
        setAddingToColumn(null);

        toast({
          title: 'Tarea creada',
          description: 'La tarea se ha creado correctamente',
        });
      }
    } catch (error) {
      console.error('Error al crear tarea:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la tarea',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kanbanData.columnOrder.map(columnId => {
            const column = kanbanData.columns[columnId];

            return (
              <div key={columnId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">{column.title}</h3>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setAddingToColumn(columnId)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {addingToColumn === columnId && (
                  <div className="mb-4 flex space-x-2">
                    <Input
                      placeholder="Título de la tarea"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                    <Button onClick={() => handleAddTask(columnId)}>
                      Añadir
                    </Button>
                  </div>
                )}

                <Droppable droppableId={columnId}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="min-h-[200px]"
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={`task-${task.id}`}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-3 rounded-md mb-2 shadow-sm"
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">{task.title}</h4>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Editar</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">
                                      Eliminar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              {task.description && (
                                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                              )}
                              <div className="mt-2 flex justify-between items-center">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {task.priority === 'high' ? 'Alta' :
                                   task.priority === 'medium' ? 'Media' : 'Baja'}
                                </span>
                                {task.assigneeId && (
                                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                                    A
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}