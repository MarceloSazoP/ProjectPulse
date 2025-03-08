
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '../../hooks/use-toast';
import { format, addDays, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Task {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: string;
  assigneeId?: number;
}

interface GanttChartProps {
  projectId: number;
}

export default function GanttChart({ projectId }: GanttChartProps) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectDates, setProjectDates] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos del proyecto
        const projectResponse = await apiRequest('GET', `/api/projects/${projectId}`);
        const projectData = await projectResponse.json();
        
        if (projectData.startDate && projectData.endDate) {
          setProjectDates({
            startDate: new Date(projectData.startDate),
            endDate: new Date(projectData.endDate),
          });
        }

        // Obtener tareas del proyecto
        const tasksResponse = await apiRequest('GET', `/api/projects/${projectId}/tasks`);
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      } catch (error) {
        console.error('Error al cargar datos para el diagrama de Gantt:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos para el diagrama de Gantt',
          variant: 'destructive',
        });
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  // Si no hay fechas de proyecto, mostrar mensaje
  if (!projectDates.startDate || !projectDates.endDate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diagrama de Gantt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            El proyecto no tiene fechas definidas para mostrar el diagrama de Gantt.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calcular el total de días del proyecto
  const totalDays = differenceInDays(projectDates.endDate, projectDates.startDate) + 1;
  
  // Generar array de fechas para el encabezado
  const generateDateHeaders = () => {
    const headers = [];
    let currentDate = projectDates.startDate as Date;
    
    for (let i = 0; i < totalDays; i++) {
      headers.push(addDays(currentDate, i));
    }
    
    return headers;
  };
  
  const dateHeaders = generateDateHeaders();

  // Función para calcular la posición y ancho de las barras de tareas
  const calculateTaskBar = (task: Task) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    
    // Calcular offset desde el inicio del proyecto (en días)
    const offsetDays = Math.max(0, differenceInDays(taskStart, projectDates.startDate as Date));
    
    // Calcular duración de la tarea (en días)
    const duration = Math.max(1, differenceInDays(taskEnd, taskStart) + 1);
    
    // Calcular ancho porcentual
    const widthPercent = (duration / totalDays) * 100;
    
    // Calcular offset porcentual
    const offsetPercent = (offsetDays / totalDays) * 100;
    
    return {
      offset: `${offsetPercent}%`,
      width: `${widthPercent}%`,
      color: getStatusColor(task.status),
    };
  };
  
  // Función para obtener color según estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagrama de Gantt</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Encabezado con fechas */}
          <div className="flex border-b mb-4">
            <div className="w-1/4 font-medium p-2">Tarea</div>
            <div className="w-3/4 flex">
              {dateHeaders.map((date, index) => (
                <div 
                  key={index} 
                  className={`text-center text-xs p-1 flex-1 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                >
                  {format(date, 'dd MMM', { locale: es })}
                </div>
              ))}
            </div>
          </div>
          
          {/* Filas de tareas */}
          {tasks.length > 0 ? (
            tasks.map(task => {
              const { offset, width, color } = calculateTaskBar(task);
              
              return (
                <div key={task.id} className="flex mb-4 items-center">
                  <div className="w-1/4 p-2">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(task.startDate), 'dd/MM/yyyy')} - {format(new Date(task.endDate), 'dd/MM/yyyy')}
                    </div>
                  </div>
                  <div className="w-3/4 relative h-8">
                    {/* Líneas de fondo para cada día */}
                    <div className="absolute inset-0 flex">
                      {dateHeaders.map((_, index) => (
                        <div 
                          key={index} 
                          className={`flex-1 border-r ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                        />
                      ))}
                    </div>
                    
                    {/* Barra de la tarea */}
                    <div 
                      className={`absolute h-6 top-1 rounded-md ${color} flex items-center justify-center text-white text-xs`}
                      style={{ 
                        left: offset, 
                        width: width
                      }}
                    >
                      {task.progress > 0 && (
                        <div className="absolute left-0 top-0 bottom-0 bg-white bg-opacity-30" style={{ width: `${task.progress}%` }} />
                      )}
                      {task.title}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay tareas disponibles para mostrar en el diagrama de Gantt.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
