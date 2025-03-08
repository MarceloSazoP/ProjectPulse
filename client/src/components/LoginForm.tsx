import React, { useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';

export function LoginForm() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate successful login with hardcoded credentials (Temporary workaround)
      if (username === 'admin' && password === 'admin123') {
        // In a production environment, replace this with actual API call: await apiClient.login(username, password);
        // For now, we're just navigating to simulate successful login
        // Redirigir o actualizar UI después del login exitoso
        console.log("Login successful (simulated)."); // Indicate successful simulated login
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError('Credenciales incorrectas. Use admin/admin123');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="admin"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Usuario: admin | Contraseña: admin123
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}