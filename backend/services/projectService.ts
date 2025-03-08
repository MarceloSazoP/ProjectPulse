import { db } from '../db';
import type { ProjectInput } from '../schemas/projectSchema';

// Tipos de retorno estandarizados
type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export const getProjects = async (): Promise<ServiceResponse<any[]>> => {
  try {
    const projects = await db.query(`
      SELECT p.*, d.name as department_name, u.name as manager_name
      FROM projects p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN users u ON p.manager_id = u.id
      ORDER BY p.start_date DESC
    `);
    
    return { success: true, data: projects };
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    return { success: false, error: 'Error al obtener proyectos' };
  }
};

export const getProjectById = async (id: number): Promise<ServiceResponse<any>> => {
  try {
    const [project] = await db.query(`
      SELECT p.*, d.name as department_name, u.name as manager_name
      FROM projects p
      LEFT JOIN departments d ON p.department_id = d.id
      LEFT JOIN users u ON p.manager_id = u.id
      WHERE p.id = $1
    `, [id]);
    
    if (!project) {
      return { success: false, error: 'Proyecto no encontrado' };
    }
    
    return { success: true, data: project };
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    return { success: false, error: 'Error al obtener proyecto' };
  }
};

export const createProject = async (projectData: ProjectInput): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si el departamento existe (si se proporciona)
    if (projectData.department_id) {
      const [department] = await db.query('SELECT * FROM departments WHERE id = $1', [projectData.department_id]);
      
      if (!department) {
        return { success: false, error: 'El departamento especificado no existe' };
      }
    }
    
    // Verificar si el manager existe (si se proporciona)
    if (projectData.manager_id) {
      const [manager] = await db.query('SELECT * FROM users WHERE id = $1', [projectData.manager_id]);
      
      if (!manager) {
        return { success: false, error: 'El usuario manager especificado no existe' };
      }
    }
    
    const [newProject] = await db.query(
      `INSERT INTO projects 
       (name, description, start_date, end_date, status, budget, manager_id, department_id, files) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        projectData.name,
        projectData.description,
        projectData.start_date,
        projectData.end_date,
        projectData.status,
        projectData.budget,
        projectData.manager_id,
        projectData.department_id,
        projectData.files || []
      ]
    );
    
    return { success: true, data: newProject };
  } catch (error) {
    console.error('Error al crear proyecto:', error);
    return { success: false, error: 'Error al crear proyecto' };
  }
};

export const updateProject = async (id: number, projectData: Partial<ProjectInput>): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si el proyecto existe
    const [project] = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    
    if (!project) {
      return { success: false, error: 'Proyecto no encontrado' };
    }
    
    // Verificar si el departamento existe (si se proporciona)
    if (projectData.department_id) {
      const [department] = await db.query('SELECT * FROM departments WHERE id = $1', [projectData.department_id]);
      
      if (!department) {
        return { success: false, error: 'El departamento especificado no existe' };
      }
    }
    
    // Verificar si el manager existe (si se proporciona)
    if (projectData.manager_id) {
      const [manager] = await db.query('SELECT * FROM users WHERE id = $1', [projectData.manager_id]);
      
      if (!manager) {
        return { success: false, error: 'El usuario manager especificado no existe' };
      }
    }
    
    const [updatedProject] = await db.query(
      `UPDATE projects SET 
        name = $1, 
        description = $2,
        start_date = $3,
        end_date = $4,
        status = $5,
        budget = $6,
        manager_id = $7,
        department_id = $8,
        files = $9
       WHERE id = $10 
       RETURNING *`,
      [
        projectData.name || project.name,
        projectData.description !== undefined ? projectData.description : project.description,
        projectData.start_date || project.start_date,
        projectData.end_date || project.end_date,
        projectData.status || project.status,
        projectData.budget !== undefined ? projectData.budget : project.budget,
        projectData.manager_id !== undefined ? projectData.manager_id : project.manager_id,
        projectData.department_id !== undefined ? projectData.department_id : project.department_id,
        projectData.files || project.files,
        id
      ]
    );
    
    return { success: true, data: updatedProject };
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    return { success: false, error: 'Error al actualizar proyecto' };
  }
};

export const deleteProject = async (id: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si el proyecto existe
    const [project] = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    
    if (!project) {
      return { success: false, error: 'Proyecto no encontrado' };
    }
    
    // Verificar si hay tareas asociadas a este proyecto
    const [taskCount] = await db.query(
      'SELECT COUNT(*) as count FROM tasks WHERE project_id = $1',
      [id]
    );
    
    if (taskCount.count > 0) {
      // Eliminar tareas asociadas a este proyecto
      await db.query('DELETE FROM tasks WHERE project_id = $1', [id]);
    }
    
    // Verificar si hay tableros kanban asociados a este proyecto
    const [kanbanCount] = await db.query(
      'SELECT COUNT(*) as count FROM kanban_boards WHERE project_id = $1',
      [id]
    );
    
    if (kanbanCount.count > 0) {
      // Eliminar los tableros kanban y sus dependencias
      const boards = await db.query('SELECT id FROM kanban_boards WHERE project_id = $1', [id]);
      
      for (const board of boards) {
        // Eliminar todas las dependencias de las tarjetas asociadas a este tablero
        await db.query(`
          DELETE FROM kanban_card_dependencies 
          WHERE card_id IN (
            SELECT kc.id FROM kanban_cards kc
            JOIN kanban_columns kcol ON kc.column_id = kcol.id
            WHERE kcol.board_id = $1
          ) OR depends_on_card_id IN (
            SELECT kc.id FROM kanban_cards kc
            JOIN kanban_columns kcol ON kc.column_id = kcol.id
            WHERE kcol.board_id = $1
          )
        `, [board.id]);
        
        // Eliminar todas las tarjetas asociadas a las columnas de este tablero
        await db.query(`
          DELETE FROM kanban_cards 
          WHERE column_id IN (
            SELECT id FROM kanban_columns WHERE board_id = $1
          )
        `, [board.id]);
        
        // Eliminar todas las columnas asociadas a este tablero
        await db.query('DELETE FROM kanban_columns WHERE board_id = $1', [board.id]);
      }
      
      // Eliminar los tableros
      await db.query('DELETE FROM kanban_boards WHERE project_id = $1', [id]);
    }
    
    // Eliminar el proyecto
    await db.query('DELETE FROM projects WHERE id = $1', [id]);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar proyecto:', error);
    return { success: false, error: 'Error al eliminar proyecto' };
  }
};

export const addFileToProject = async (projectId: number, filePath: string): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si el proyecto existe
    const [project] = await db.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    
    if (!project) {
      return { success: false, error: 'Proyecto no encontrado' };
    }
    
    // Añadir el archivo al array de archivos
    const files = project.files || [];
    files.push(filePath);
    
    const [updatedProject] = await db.query(
      'UPDATE projects SET files = $1 WHERE id = $2 RETURNING *',
      [files, projectId]
    );
    
    return { success: true, data: updatedProject };
  } catch (error) {
    console.error('Error al añadir archivo al proyecto:', error);
    return { success: false, error: 'Error al añadir archivo al proyecto' };
  }
};

export const removeFileFromProject = async (projectId: number, filePath: string): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si el proyecto existe
    const [project] = await db.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    
    if (!project) {
      return { success: false, error: 'Proyecto no encontrado' };
    }
    
    // Eliminar el archivo del array de archivos
    const files = project.files || [];
    const updatedFiles = files.filter((file: string) => file !== filePath);
    
    const [updatedProject] = await db.query(
      'UPDATE projects SET files = $1 WHERE id = $2 RETURNING *',
      [updatedFiles, projectId]
    );
    
    return { success: true, data: updatedProject };
  } catch (error) {
    console.error('Error al eliminar archivo del proyecto:', error);
    return { success: false, error: 'Error al eliminar archivo del proyecto' };
  }
};