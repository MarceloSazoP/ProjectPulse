
import { useState, useEffect } from 'react';
import { Router, Route, Switch, useLocation } from 'wouter';
import { useAuth } from './hooks/use-auth';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/admin-dashboard';
import DepartmentManagement from './components/department-management';
import UserManagement from './components/users/user-management';
import ProjectManagement from './components/projects/project-management';

// Componente para proteger rutas
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return user ? <Component {...rest} /> : null;
};

// Página principal que contiene el Dashboard y la navegación
function Dashboard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-white p-4">
        <h1 className="text-2xl font-bold">Project Pulse</h1>
      </header>
      <div className="flex flex-1">
        <nav className="w-64 bg-gray-100 p-4">
          <ul className="space-y-2">
            <li>
              <a href="/" className="block p-2 rounded hover:bg-gray-200">Dashboard</a>
            </li>
            <li>
              <a href="/projects" className="block p-2 rounded hover:bg-gray-200">Proyectos</a>
            </li>
            <li>
              <a href="/departments" className="block p-2 rounded hover:bg-gray-200">Departamentos</a>
            </li>
            <li>
              <a href="/users" className="block p-2 rounded hover:bg-gray-200">Usuarios</a>
            </li>
          </ul>
        </nav>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Página de autenticación
function AuthPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return <LoginForm />;
}

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login" component={AuthPage} />
        <Route path="/">
          <ProtectedRoute
            component={() => (
              <Dashboard>
                <AdminDashboard />
              </Dashboard>
            )}
          />
        </Route>
        <Route path="/departments">
          <ProtectedRoute
            component={() => (
              <Dashboard>
                <DepartmentManagement />
              </Dashboard>
            )}
          />
        </Route>
        <Route path="/users">
          <ProtectedRoute
            component={() => (
              <Dashboard>
                <UserManagement />
              </Dashboard>
            )}
          />
        </Route>
        <Route path="/projects">
          <ProtectedRoute
            component={() => (
              <Dashboard>
                <ProjectManagement />
              </Dashboard>
            )}
          />
        </Route>
      </Switch>
    </Router>
  );
}
