
import { query } from '../db';

// Interfaz para los datos de un proyecto
export interface Project {
  id?: number;
  name: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  budget?: number;
  manager_id?: number;
  department_id?: number;
  files?: string[];
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
      status: 'active',
      budget: 50000,
      manager_id: 1,
      files: ['documento1.pdf', 'imagen1.jpg']
    }
  ];
}

// Obtener un proyecto por ID
export async function getProjectById(id: number): Promise<Project | null> {
  const sql = 'SELECT * FROM projects WHERE id = $1';
  // En producción, descomentar la siguiente línea:
  // const results = await query(sql, [id]);
  // return results.length ? results[0] : null;
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, [id]);
  return {
    id: id,
    name: 'Proyecto ' + id,
    description: 'Descripción del proyecto ' + id,
    start_date: new Date(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    status: 'active',
    budget: 50000,
    manager_id: 1,
    files: ['documento1.pdf', 'imagen1.jpg']
  };
}

// Crear un nuevo proyecto
export async function createProject(projectData: Project): Promise<Project> {
  const { name, description, start_date, end_date, status, budget, manager_id, department_id, files } = projectData;
  
  const sql = `
    INSERT INTO projects (name, description, start_date, end_date, status, budget, manager_id, department_id, files)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
  
  const values = [name, description, start_date, end_date, status, budget, manager_id, department_id, files];
  
  // En producción, descomentar la siguiente línea:
  // const result = await query(sql, values);
  // return result[0];
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, values);
  return {
    id: Math.floor(Math.random() * 1000),
    ...projectData
  };
}

// Actualizar un proyecto
export async function updateProject(id: number, projectData: Partial<Project>): Promise<Project | null> {
  // Construir la consulta de actualización dinámicamente
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  // Añadir cada campo a actualizar
  for (const [key, value] of Object.entries(projectData)) {
    if (value !== undefined) {
      updates.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }
  
  // Añadir el ID como último parámetro
  values.push(id);
  
  if (updates.length === 0) {
    return getProjectById(id);
  }
  
  const sql = `
    UPDATE projects
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  // En producción, descomentar la siguiente línea:
  // const results = await query(sql, values);
  // return results.length ? results[0] : null;
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, values);
  return {
    id: id,
    name: projectData.name || 'Proyecto actualizado',
    description: projectData.description || 'Descripción actualizada',
    start_date: projectData.start_date || new Date(),
    end_date: projectData.end_date || new Date(new Date().setMonth(new Date().getMonth() + 3)),
    status: projectData.status || 'active',
    budget: projectData.budget || 60000,
    manager_id: projectData.manager_id || 1,
    files: projectData.files || ['documento_actualizado.pdf']
  };
}

// Eliminar un proyecto
export async function deleteProject(id: number): Promise<boolean> {
  const sql = 'DELETE FROM projects WHERE id = $1 RETURNING id';
  
  // En producción, descomentar la siguiente línea:
  // const results = await query(sql, [id]);
  // return results.length > 0;
  
  // Simulación para desarrollo
  console.log('Simulando consulta:', sql, [id]);
  return true;
}
