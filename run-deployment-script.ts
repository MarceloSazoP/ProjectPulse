
import { createDeploymentPackage, testBackendServer } from './server/deploy-helpers';

// Ejecutar la creación del paquete de despliegue
createDeploymentPackage('./deployment');

// Si quieres probar el servidor de prueba, descomenta la siguiente línea
// testBackendServer();

console.log('\nInstrucciones de despliegue:');
console.log('1. Descarga la carpeta "deployment" generada');
console.log('2. Sube todos los archivos a tu servidor');
console.log('3. Ejecuta "npm install" en el servidor');
console.log('4. Crea un archivo .env con tu SESSION_SECRET');
console.log('5. Inicia el servidor con "npm start"');
console.log('\nEl backend estará disponible en el puerto 5000');
