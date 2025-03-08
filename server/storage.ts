/**
 * Storage Service
 * 
 * Este servicio proporciona métodos para interactuar con la base de datos.
 * En desarrollo, utiliza datos simulados. En producción, se conecta a PostgreSQL.
 */

import { InsertProject, InsertTask, Project, Task, Team, User } from '../shared/schema';

// Datos de ejemplo para desarrollo
let mockProjects: Project[] = [
  {
    id: 1,
    name: 'Portal Web Corporativo',
    description: 'Desarrollo de un portal web corporativo responsive',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    budget: 5000,
    managerId: 1,
    departmentId: 1,
    files: []
  },
  {
    id: 2,
    name: 'Aplicación Móvil',
    description: 'Desarrollo de una aplicación móvil para iOS y Android',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'planning',
    budget: 8000,
    managerId: 2,
    departmentId: 2,
    files: []
  }
];

let mockTasks: Task[] = [
  {
    id: 1,
    title: 'Diseño de interfaz',
    description: 'Crear diseño de interfaz para la aplicación',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    projectId: 1,
    assigneeId: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Implementación de API',
    description: 'Implementar endpoints de API RESTful',
    status: 'todo_today',
    priority: 'medium',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    projectId: 1,
    assigneeId: 4,
    createdAt: new Date().toISOString()
  }
];

let mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123', // En producción, usar hash
    role: 'admin',
    departmentId: 1,
    profileId: 1
  },
  {
    id: 2,
    username: 'manager1',
    password: 'manager123',
    role: 'manager',
    departmentId: 1,
    profileId: 2
  },
  {
    id: 3,
    username: 'developer1',
    password: 'dev123',
    role: 'member',
    departmentId: 2,
    profileId: 3
  },
  {
    id: 4,
    username: 'developer2',
    password: 'dev123',
    role: 'member',
    departmentId: 2,
    profileId: 3
  }
];

let mockTeams: Team[] = [
  {
    id: 1,
    name: 'Equipo Frontend',
    description: 'Especialistas en desarrollo frontend'
  },
  {
    id: 2,
    name: 'Equipo Backend',
    description: 'Especialistas en desarrollo backend'
  }
];

// Implementación para desarrollo
export const storage = {
  // Proyectos
  getProjects: async (): Promise<Project[]> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // return db.select().from(projects);
    return mockProjects;
  },

  getProject: async (id: number): Promise<Project | undefined> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // return db.select().from(projects).where(eq(projects.id, id)).then(res => res[0] || undefined);
    return mockProjects.find(p => p.id === id);
  },

  createProject: async (data: InsertProject): Promise<Project> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const [newProject] = await db.insert(projects).values(data).returning();
    // return newProject;
    const newProject = {
      ...data,
      id: mockProjects.length + 1,
      files: []
    } as Project;

    mockProjects.push(newProject);
    return newProject;
  },

  updateProject: async (id: number, data: Partial<InsertProject>): Promise<Project> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const [updatedProject] = await db.update(projects)
    //  .set(data)
    //  .where(eq(projects.id, id))
    //  .returning();
    // return updatedProject;

    const index = mockProjects.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProjects[index] = { ...mockProjects[index], ...data };
      return mockProjects[index];
    }
    throw new Error('Project not found');
  },

  deleteProject: async (id: number): Promise<void> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // await db.delete(projects).where(eq(projects.id, id));
    mockProjects = mockProjects.filter(p => p.id !== id);
  },

  getProjectTeams: async (projectId: number): Promise<Team[]> => {
    // PRODUCCIÓN: Implementar consulta adecuada 
    return mockTeams;
  },

  assignTeamToProject: async (projectId: number, teamId: number): Promise<{ projectId: number, teamId: number }> => {
    // PRODUCCIÓN: Implementar asignación adecuada
    return { projectId, teamId };
  },

  // Tareas
  getAllTasks: async (): Promise<Task[]> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // return db.select().from(tasks);
    return mockTasks;
  },

  getTask: async (id: number): Promise<Task | undefined> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // return db.select().from(tasks).where(eq(tasks.id, id)).then(res => res[0] || undefined);
    return mockTasks.find(t => t.id === id);
  },

  getTasks: async (projectId: number): Promise<Task[]> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // return db.select().from(tasks).where(eq(tasks.projectId, projectId));
    return mockTasks.filter(t => t.projectId === projectId);
  },

  createTask: async (data: InsertTask): Promise<Task> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const [newTask] = await db.insert(tasks).values(data).returning();
    // return newTask;
    const newTask = {
      ...data,
      id: mockTasks.length + 1,
      createdAt: new Date().toISOString()
    } as Task;

    mockTasks.push(newTask);
    return newTask;
  },

  updateTask: async (id: number, data: Partial<InsertTask>): Promise<Task> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const [updatedTask] = await db.update(tasks)
    //  .set(data)
    //  .where(eq(tasks.id, id))
    //  .returning();
    // return updatedTask;

    const index = mockTasks.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTasks[index] = { ...mockTasks[index], ...data };
      return mockTasks[index];
    }
    throw new Error('Task not found');
  },

  deleteTask: async (id: number): Promise<void> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // await db.delete(tasks).where(eq(tasks.id, id));
    mockTasks = mockTasks.filter(t => t.id !== id);
  },

  assignTaskToUser: async (taskId: number, userId: number): Promise<Task> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const [updatedTask] = await db.update(tasks)
    //  .set({ assigneeId: userId })
    //  .where(eq(tasks.id, taskId))
    //  .returning();
    // return updatedTask;

    const task = mockTasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    task.assigneeId = userId;
    return task;
  },

  // Usuarios
  getUsers: async (): Promise<User[]> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // return db.select().from(users);
    return mockUsers;
  },

  getUser: async (id: number): Promise<User | undefined> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // return db.select().from(users).where(eq(users.id, id)).then(res => res[0] || undefined);
    return mockUsers.find(u => u.id === id);
  },

  getUserByUsername: async (username: string): Promise<User | undefined> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // return db.select().from(users).where(eq(users.username, username)).then(res => res[0] || undefined);
    return mockUsers.find(u => u.username === username);
  },

  createUser: async (userData: any): Promise<User> => {
    // PRODUCCIÓN: Descomentar para usar la conexión real a la base de datos
    // const [newUser] = await db.insert(users).values(userData).returning();
    // return newUser;
    
    const newUser = {
      ...userData,
      id: mockUsers.length + 1,
      departmentId: 1,
      profileId: 1
    } as User;
    
    mockUsers.push(newUser);
    return newUser;
  }
};