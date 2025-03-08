
import { db } from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { UserInput, LoginInput } from '../schemas/userSchema';

// Tipos de retorno estandarizados
type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export const getUsers = async (): Promise<ServiceResponse<any[]>> => {
  try {
    const users = await db.query(
      'SELECT id, name, email, profile_picture, created_at, updated_at FROM users ORDER BY name ASC'
    );
    
    return { success: true, data: users };
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return { success: false, error: 'Error al obtener usuarios' };
  }
};

export const getUserById = async (id: number): Promise<ServiceResponse<any>> => {
  try {
    const [user] = await db.query(
      'SELECT id, name, email, profile_picture, created_at, updated_at FROM users WHERE id = $1', 
      [id]
    );
    
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    return { success: true, data: user };
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return { success: false, error: 'Error al obtener usuario' };
  }
};

export const createUser = async (userData: UserInput): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si el email ya está en uso
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [userData.email]
    );
    
    if (existingUser) {
      return { success: false, error: 'Este email ya está registrado' };
    }
    
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [newUser] = await db.query(
      `INSERT INTO users (name, email, password, profile_picture) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, profile_picture, created_at, updated_at`,
      [userData.name, userData.email, hashedPassword, userData.profile_picture]
    );
    
    return { success: true, data: newUser };
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return { success: false, error: 'Error al crear usuario' };
  }
};

export const updateUser = async (id: number, userData: Partial<UserInput>): Promise<ServiceResponse<any>> => {
  try {
    // Verificar si el usuario existe
    const [user] = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    // Verificar si se está actualizando el email y si ya está en uso
    if (userData.email && userData.email !== user.email) {
      const [existingUser] = await db.query(
        'SELECT * FROM users WHERE email = $1 AND id != $2',
        [userData.email, id]
      );
      
      if (existingUser) {
        return { success: false, error: 'Este email ya está registrado por otro usuario' };
      }
    }
    
    let hashedPassword = user.password;
    if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, 10);
    }
    
    const [updatedUser] = await db.query(
      `UPDATE users SET 
        name = $1, 
        email = $2, 
        password = $3,
        profile_picture = $4,
        updated_at = NOW()
       WHERE id = $5 
       RETURNING id, name, email, profile_picture, created_at, updated_at`,
      [
        userData.name || user.name,
        userData.email || user.email,
        hashedPassword,
        userData.profile_picture !== undefined ? userData.profile_picture : user.profile_picture,
        id
      ]
    );
    
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return { success: false, error: 'Error al actualizar usuario' };
  }
};

export const deleteUser = async (id: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si el usuario existe
    const [user] = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    // Eliminar relaciones del usuario primero
    await db.query('DELETE FROM user_departments WHERE user_id = $1', [id]);
    await db.query('DELETE FROM user_roles WHERE user_id = $1', [id]);
    await db.query('DELETE FROM team_members WHERE user_id = $1', [id]);
    
    // Actualizar tareas asignadas a este usuario
    await db.query('UPDATE tasks SET assignee_id = NULL WHERE assignee_id = $1', [id]);
    
    // Actualizar tarjetas Kanban asignadas a este usuario
    await db.query('UPDATE kanban_cards SET assigned_to = NULL WHERE assigned_to = $1', [id]);
    
    // Actualizar proyectos gestionados por este usuario
    await db.query('UPDATE projects SET manager_id = NULL WHERE manager_id = $1', [id]);
    
    // Finalmente eliminar el usuario
    await db.query('DELETE FROM users WHERE id = $1', [id]);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return { success: false, error: 'Error al eliminar usuario' };
  }
};

export const login = async (loginData: LoginInput): Promise<ServiceResponse<any>> => {
  try {
    // Buscar usuario por email
    const [user] = await db.query('SELECT * FROM users WHERE email = $1', [loginData.email]);
    
    if (!user) {
      return { success: false, error: 'Credenciales inválidas' };
    }
    
    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(loginData.password, user.password);
    
    if (!passwordMatch) {
      return { success: false, error: 'Credenciales inválidas' };
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    return { 
      success: true, 
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile_picture: user.profile_picture
        },
        token
      }
    };
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return { success: false, error: 'Error al iniciar sesión' };
  }
};

export const getUserRoles = async (userId: number): Promise<ServiceResponse<any[]>> => {
  try {
    const roles = await db.query(
      `SELECT r.* FROM roles r
       JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId]
    );
    
    return { success: true, data: roles };
  } catch (error) {
    console.error('Error al obtener roles del usuario:', error);
    return { success: false, error: 'Error al obtener roles del usuario' };
  }
};

export const getUserPermissions = async (userId: number): Promise<ServiceResponse<any[]>> => {
  try {
    const permissions = await db.query(
      `SELECT DISTINCT p.* FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId]
    );
    
    return { success: true, data: permissions };
  } catch (error) {
    console.error('Error al obtener permisos del usuario:', error);
    return { success: false, error: 'Error al obtener permisos del usuario' };
  }
};

export const assignRoleToUser = async (userId: number, roleId: number): Promise<ServiceResponse<void>> => {
  try {
    // Verificar si el usuario existe
    const [user] = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    // Verificar si el rol existe
    const [role] = await db.query('SELECT * FROM roles WHERE id = $1', [roleId]);
    
    if (!role) {
      return { success: false, error: 'Rol no encontrado' };
    }
    
    // Verificar si la asignación ya existe
    const [existingAssignment] = await db.query(
      'SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [userId, roleId]
    );
    
    if (existingAssignment) {
      return { success: false, error: 'El usuario ya tiene asignado este rol' };
    }
    
    await db.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)',
      [userId, roleId]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error al asignar rol al usuario:', error);
    return { success: false, error: 'Error al asignar rol al usuario' };
  }
};

export const removeRoleFromUser = async (userId: number, roleId: number): Promise<ServiceResponse<void>> => {
  try {
    await db.query(
      'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [userId, roleId]
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar rol del usuario:', error);
    return { success: false, error: 'Error al eliminar rol del usuario' };
  }
};
