
import { query } from '../db';

// Interfaz para los datos de un proyecto
export interface Project {
  id?: number;
  name: string;
  description?: string;
  start_date?: Date;
  end_date?: Date;
  status?: 'Planned' | 'In Progress' | 'Completed';
  created_by?: number;
  created_at?: Date;
}

// Obtener todos los proyectos
export async function getAllProjects(): Promise<Project[]> {
  const sql = 'SELECT * FROM projects ORDER BY id DESC';
  // En desarrollo, simulamos datos
  // En producción, descomentar la siguiente línea:
  // return await query(sql);
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql);
  return [
    {
      id: 1,
      name: 'Proyecto Demo',
      description: 'Este es un proyecto de demostración',
      start_date: new Date(),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      status: 'In Progress',
      created_by: 1,
      created_at: new Date()
    }
  ];
}

// Obtener un proyecto por ID
export async function getProjectById(id: number): Promise<Project | null> {
  const sql = 'SELECT * FROM projects WHERE id = $1';
  // En producción, descomentar la siguiente línea:
  // const result = await query(sql, [id]);
  // return result.length > 0 ? result[0] : null;
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, 'con id:', id);
  if (id === 1) {
    return {
      id: 1,
      name: 'Proyecto Demo',
      description: 'Este es un proyecto de demostración',
      start_date: new Date(),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      status: 'In Progress',
      created_by: 1,
      created_at: new Date()
    };
  }
  return null;
}

// Crear un nuevo proyecto
export async function createProject(project: Project): Promise<Project> {
  const sql = `
    INSERT INTO projects (name, description, start_date, end_date, status, created_by)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  // En producción, descomentar la siguiente línea:
  // return (await query(sql, [
  //   project.name,
  //   project.description,
  //   project.start_date,
  //   project.end_date,
  //   project.status || 'Planned',
  //   project.created_by
  // ]))[0];
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, 'con datos:', project);
  return {
    id: Math.floor(Math.random() * 1000) + 1,
    ...project,
    status: project.status || 'Planned',
    created_at: new Date()
  };
}

// Actualizar un proyecto existente
export async function updateProject(id: number, project: Partial<Project>): Promise<Project | null> {
  // Primero, verificar si el proyecto existe
  const existingProject = await getProjectById(id);
  if (!existingProject) {
    return null;
  }

  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  // Construir dinámicamente la consulta SQL según los campos proporcionados
  if (project.name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(project.name);
  }
  if (project.description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(project.description);
  }
  if (project.start_date !== undefined) {
    updates.push(`start_date = $${paramCount++}`);
    values.push(project.start_date);
  }
  if (project.end_date !== undefined) {
    updates.push(`end_date = $${paramCount++}`);
    values.push(project.end_date);
  }
  if (project.status !== undefined) {
    updates.push(`status = $${paramCount++}`);
    values.push(project.status);
  }

  // Si no hay nada que actualizar, devolver el proyecto existente
  if (updates.length === 0) {
    return existingProject;
  }

  const sql = `
    UPDATE projects
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  values.push(id);

  // En producción, descomentar la siguiente línea:
  // return (await query(sql, values))[0];
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, 'con valores:', values);
  return {
    ...existingProject,
    ...project,
    id
  };
}

// Eliminar un proyecto
export async function deleteProject(id: number): Promise<boolean> {
  const sql = 'DELETE FROM projects WHERE id = $1 RETURNING id';
  // En producción, descomentar la siguiente línea:
  // const result = await query(sql, [id]);
  // return result.length > 0;
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, 'con id:', id);
  return true;
}

// Asignar un equipo a un proyecto
export async function assignTeamToProject(teamId: number, projectId: number): Promise<boolean> {
  const sql = `
    INSERT INTO team_projects (team_id, project_id)
    VALUES ($1, $2)
    RETURNING id
  `;
  // En producción, descomentar la siguiente línea:
  // const result = await query(sql, [teamId, projectId]);
  // return result.length > 0;
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, 'con teamId:', teamId, 'y projectId:', projectId);
  return true;
}

// Obtener los equipos de un proyecto
export async function getProjectTeams(projectId: number): Promise<any[]> {
  const sql = `
    SELECT t.* 
    FROM teams t
    JOIN team_projects tp ON t.id = tp.team_id
    WHERE tp.project_id = $1
  `;
  // En producción, descomentar la siguiente línea:
  // return await query(sql, [projectId]);
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, 'con projectId:', projectId);
  return [
    {
      id: 1,
      name: 'Equipo de Desarrollo',
      description: 'Equipo principal de desarrollo',
      created_by: 1,
      created_at: new Date()
    }
  ];
}
