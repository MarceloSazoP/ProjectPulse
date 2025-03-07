
import { hashPassword } from "./auth";
import { storage } from "./storage";

export async function seedAdminUser() {
  // Check if admin user already exists
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
}
