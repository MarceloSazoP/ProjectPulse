
-- Crear tabla de proyectos
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planning', 'active', 'completed', 'on_hold')),
  budget INTEGER,
  manager_id INTEGER,
  department_id INTEGER,
  files TEXT[]
);

-- Crear tabla de tareas
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('backlog', 'todo', 'todo_today', 'in_progress', 'end')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id INTEGER
);

-- Crear tabla de equipos
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- Crear tabla de miembros de equipos
CREATE TABLE IF NOT EXISTS team_members (
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  user_id INTEGER,
  PRIMARY KEY (team_id, user_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
