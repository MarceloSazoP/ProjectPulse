import { User, Project, Task, Team, Department, Profile, InsertUser, InsertProject, InsertTask, InsertTeam, InsertDepartment, InsertProfile } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Session store
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;

  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  addProjectFiles(projectId: number, filenames: string[]): Promise<void>;
  getProjectFiles(projectId: number): Promise<string[]>;
  removeProjectFile(projectId: number, filename: string): Promise<void>;

  // Task operations
  getTasks(projectId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  // Team operations
  getTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, team: Partial<Team>): Promise<Team>;
  deleteTeam(id: number): Promise<void>;

  // Department operations
  getDepartments(): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, department: Partial<Department>): Promise<Department>;
  deleteDepartment(id: number): Promise<void>;

  // Profile operations
  getProfiles(): Promise<Profile[]>;
  getProfile(id: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: number, profile: Partial<Profile>): Promise<Profile>;
  deleteProfile(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private tasks: Map<number, Task>;
  private teams: Map<number, Team>;
  private departments: Map<number, Department>;
  private profiles: Map<number, Profile>;
  sessionStore: session.Store;
  currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.tasks = new Map();
    this.teams = new Map();
    this.departments = new Map();
    this.profiles = new Map();
    this.currentId = { users: 1, projects: 1, tasks: 1, teams: 1, departments: 1, profiles: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || 'member',
      departmentId: insertUser.departmentId || null,
      profileId: insertUser.profileId || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const existing = await this.getUser(id);
    if (!existing) throw new Error("User not found");
    const updated = { ...existing, ...userData };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.currentId.projects++;
    const newProject: Project = { 
      ...project, 
      id,
      description: project.description || null,
      budget: project.budget || null,
      managerId: project.managerId || null,
      files: [] // Initialize files array
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project> {
    const existing = await this.getProject(id);
    if (!existing) throw new Error("Project not found");
    const updated = { ...existing, ...project };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    this.projects.delete(id);
  }

  async addProjectFiles(projectId: number, filenames: string[]): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) throw new Error("Project not found");
    // Replace existing files with new files - only one file per project
    // First, delete any existing files physically if needed
    // (This would need to be implemented if required)

    project.files = filenames;
    this.projects.set(projectId, project);
  }

  async getProjectFiles(projectId: number): Promise<string[]> {
    const project = await this.getProject(projectId);
    return project?.files || [];
  }

  async removeProjectFile(projectId: number, filename: string): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) throw new Error("Project not found");
    project.files = (project.files || []).filter(file => file !== filename);
    this.projects.set(projectId, project);
  }


  // Task operations
  async getTasks(projectId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.projectId === projectId,
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.currentId.tasks++;
    const newTask: Task = {
      ...task,
      id,
      description: task.description || null,
      dueDate: task.dueDate || null,
      projectId: task.projectId || null,
      assigneeId: task.assigneeId || null
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, task: Partial<Task>): Promise<Task> {
    const existing = await this.getTask(id);
    if (!existing) throw new Error("Task not found");
    const updated = { ...existing, ...task };
    this.tasks.set(id, updated);
    return updated;
  }

  async deleteTask(id: number): Promise<void> {
    this.tasks.delete(id);
  }

  // Team operations
  async getTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const id = this.currentId.teams++;
    const newTeam: Team = {
      ...team,
      id,
      description: team.description || null
    };
    this.teams.set(id, newTeam);
    return newTeam;
  }

  async updateTeam(id: number, team: Partial<Team>): Promise<Team> {
    const existing = await this.getTeam(id);
    if (!existing) throw new Error("Team not found");
    const updated = { ...existing, ...team };
    this.teams.set(id, updated);
    return updated;
  }

  async deleteTeam(id: number): Promise<void> {
    this.teams.delete(id);
  }

  // Department operations
  async getDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const id = this.currentId.departments++;
    const newDepartment: Department = {
      ...department,
      id,
      description: department.description || null
    };
    this.departments.set(id, newDepartment);
    return newDepartment;
  }

  async updateDepartment(id: number, department: Partial<Department>): Promise<Department> {
    const existing = await this.getDepartment(id);
    if (!existing) throw new Error("Department not found");
    const updated = { ...existing, ...department };
    this.departments.set(id, updated);
    return updated;
  }

  async deleteDepartment(id: number): Promise<void> {
    this.departments.delete(id);
  }

  // Profile operations
  async getProfiles(): Promise<Profile[]> {
    return Array.from(this.profiles.values());
  }

  async getProfile(id: number): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const id = this.currentId.profiles++;
    const newProfile: Profile = {
      ...profile,
      id,
      description: profile.description || null,
      permissions: profile.permissions || []
    };
    this.profiles.set(id, newProfile);
    return newProfile;
  }

  async updateProfile(id: number, profile: Partial<Profile>): Promise<Profile> {
    const existing = await this.getProfile(id);
    if (!existing) throw new Error("Profile not found");
    const updated = { ...existing, ...profile };
    this.profiles.set(id, updated);
    return updated;
  }

  async deleteProfile(id: number): Promise<void> {
    this.profiles.delete(id);
  }
}

export const storage = new MemStorage();