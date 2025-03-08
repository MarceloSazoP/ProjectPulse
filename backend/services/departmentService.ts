
import { db } from '../db';
import type { DepartmentInput } from '../schemas/departmentSchema';

// Tipos de retorno estandarizados
type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export const getDepartments = async (): Promise<ServiceResponse<any[]>> => {
  try {
    const departments = await db.query('SELECT * FROM departments ORDER BY name ASC');
    return { success: true, data: departments };
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    return { success: false, error: 'Error al obtener departamentos' };
  }
};

export const getDepartmentById = async (id: number): Promise<ServiceResponse<any>> => {
  try {
    const [department] = await db.query('SELECT * FROM departments WHERE id = $1', [id]);
    
    if (!department) {
      return { success: false, error: 'Departamento no encontrado' };
    }
    
    return { success: true, data: department };
  } catch (error) {
    console.error('Error al obtener departamento:', error);
    return { success: false, error: 'Error al obtener departamento' };
  }
};

export const createDepartment = async (departmentData: DepartmentInput): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si ya existe un departamento con ese nombre
    const [existingDepartment] = await db.query(
      'SELECT * FROM departments WHERE name = $1',
      [departmentData.name]
    );
    
    if (existingDepartment) {
      return { success: false, error: 'Ya existe un departamento con ese nombre' };
    }
    
    const [newDepartment] = await db.query(
      'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *',
      [departmentData.name, departmentData.description]
    );
    
    return { success: true, data: newDepartment };
  } catch (error) {
    console.error('Error al crear departamento:', error);
    return { success: false, error: 'Error al crear departamento' };
  }
};

export const updateDepartment = async (id: number, departmentData: Partial<DepartmentInput>): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si el departamento existe
    const [department] = await db.query('SELECT * FROM departments WHERE id = $1', [id]);
    
    if (!department) {
      return { success: false, error: 'Departamento no encontrado' };
    }
    
    // Verificar si el nuevo nombre ya existe (si se está actualizando el nombre)
    if (departmentData.name && departmentData.name !== department.name) {
      const [existingDepartment] = await db.query(
        'SELECT * FROM departments WHERE name = $1 AND id != $2',
        [departmentData.name, id]
      );
      
      if (existingDepartment) {
        return { success: false, error: 'Ya existe un departamento con ese nombre' };
      }
    }
    
    const [updatedDepartment] = await db.query(
      'UPDATE departments SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [
        departmentData.name || department.name,
        departmentData.description !== undefined ? departmentData.description : department.description,
        id
      ]
    );
    
    return { success: true, data: updatedDepartment };
  } catch (error) {
    console.error('Error al actualizar departamento:', error);
    return { success: false, error: 'Error al actualizar departamento' };
  }
};

export const deleteDepartment = async (id: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si el departamento existe
    const [department] = await db.query('SELECT * FROM departments WHERE id = $1', [id]);
    
    if (!department) {
      return { success: false, error: 'Departamento no encontrado' };
    }
    
    // Verificar si hay proyectos asociados a este departamento
    const [projectCount] = await db.query(
      'SELECT COUNT(*) as count FROM projects WHERE department_id = $1',
      [id]
    );
    
    if (projectCount.count > 0) {
      return { 
        success: false, 
        error: 'No se puede eliminar el departamento porque tiene proyectos asociados' 
      };
    }
    
    await db.query('DELETE FROM departments WHERE id = $1', [id]);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar departamento:', error);
    return { success: false, error: 'Error al eliminar departamento' };
  }
};

export const getDepartmentProjects = async (departmentId: number): Promise<ServiceResponse<any[]>> => {
  try {
    const projects = await db.query(
      'SELECT * FROM projects WHERE department_id = $1 ORDER BY start_date DESC',
      [departmentId]
    );
    
    return { success: true, data: projects };
  } catch (error) {
    console.error('Error al obtener proyectos del departamento:', error);
    return { success: false, error: 'Error al obtener proyectos del departamento' };
  }
};

export const getDepartmentUsers = async (departmentId: number): Promise<ServiceResponse<any[]>> => {
  try {
    const users = await db.query(
      `SELECT u.* FROM users u
       JOIN user_departments ud ON u.id = ud.user_id
       WHERE ud.department_id = $1
       ORDER BY u.name ASC`,
      [departmentId]
    );
    
    return { success: true, data: users };
  } catch (error) {
    console.error('Error al obtener usuarios del departamento:', error);
    return { success: false, error: 'Error al obtener usuarios del departamento' };
  }
};

export const addUserToDepartment = async (departmentId: number, userId: number): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si el departamento existe
    const [department] = await db.query('SELECT * FROM departments WHERE id = $1', [departmentId]);
    
    if (!department) {
      return { success: false, error: 'Departamento no encontrado' };
    }
    
    // Verificar si el usuario existe
    const [user] = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    // Verificar si el usuario ya está en el departamento
    const [existingRelation] = await db.query(
      'SELECT * FROM user_departments WHERE user_id = $1 AND department_id = $2',
      [userId, departmentId]
    );
    
    if (existingRelation) {
      return { success: false, error: 'El usuario ya pertenece a este departamento' };
    }
    
    await db.query(
      'INSERT INTO user_departments (user_id, department_id) VALUES ($1, $2)',
      [userId, departmentId]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error al añadir usuario al departamento:', error);
    return { success: false, error: 'Error al añadir usuario al departamento' };
  }
};

export const removeUserFromDepartment = async (departmentId: number, userId: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si la relación existe
    const [relation] = await db.query(
      'SELECT * FROM user_departments WHERE user_id = $1 AND department_id = $2',
      [userId, departmentId]
    );
    
    if (!relation) {
      return { success: false, error: 'El usuario no pertenece a este departamento' };
    }
    
    await db.query(
      'DELETE FROM user_departments WHERE user_id = $1 AND department_id = $2',
      [userId, departmentId]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar usuario del departamento:', error);
    return { success: false, error: 'Error al eliminar usuario del departamento' };
  }
};
