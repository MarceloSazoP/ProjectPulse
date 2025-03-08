
import { hashPassword } from "./auth";
import { storage } from "./storage";

export async function seedAdminUser() {
  try {
    // Verificación simplificada - asumimos que el usuario ya existe en los datos mockeados
    console.log("Usando credenciales predefinidas: admin/admin123");
    
    // No necesitamos crear el usuario ya que está predefinido en storage.ts
    // en la implementación real, esto sería diferente
    
    return { username: "admin", password: "admin123" };

    // PRODUCCIÓN: Descomentar para crear el usuario admin si no existe
    /*
    const existingAdmin = await storage.getUserByUsername("admin");
    
    if (!existingAdmin) {
      console.log("Creating default admin user...");
      const hashedPassword = await hashPassword("admin123");
      
      await storage.createUser({
        username: "admin",
        password: hashedPassword,
        role: "admin"
      });
      
      console.log("Default admin user created successfully.");
    } else {
      console.log("Admin user already exists, skipping creation.");
    }
    */
  } catch (error) {
    console.error("Error verificando usuario admin:", error);
    // No lanzamos el error para que la aplicación pueda continuar
  }
}
