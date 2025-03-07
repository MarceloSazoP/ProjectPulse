import { create } from 'zustand';
import { Project, Task } from '@shared/schema';

interface ProjectState {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  isDraggingTask: boolean;
  setIsDraggingTask: (isDragging: boolean) => void;
  draggedTask: Task | null;
  setDraggedTask: (task: Task | null) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
  isDraggingTask: false,
  setIsDraggingTask: (isDragging) => set({ isDraggingTask: isDragging }),
  draggedTask: null,
  setDraggedTask: (task) => set({ draggedTask: task }),
}));
