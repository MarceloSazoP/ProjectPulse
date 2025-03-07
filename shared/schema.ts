import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoles = ['admin', 'manager', 'member', 'client'] as const;
export type UserRole = typeof userRoles[number];

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: userRoles }).notNull().default('member'),
});

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status", { enum: ['planning', 'active', 'completed', 'on_hold'] }).notNull(),
  budget: integer("budget"),
  managerId: integer("manager_id").references(() => users.id),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", { enum: ['backlog', 'todo', 'todo_today', 'in_progress', 'end'] }).notNull(),
  priority: text("priority", { enum: ['low', 'medium', 'high'] }).notNull(),
  dueDate: timestamp("due_date"),
  projectId: integer("project_id").references(() => projects.id),
  assigneeId: integer("assignee_id").references(() => users.id),
});

// Teams table
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

// Team members junction table
export const teamMembers = pgTable("team_members", {
  teamId: integer("team_id").references(() => teams.id),
  userId: integer("user_id").references(() => users.id),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertProjectSchema = createInsertSchema(projects);
export const insertTaskSchema = createInsertSchema(tasks);
export const insertTeamSchema = createInsertSchema(teams);

// Types
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Team = typeof teams.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;