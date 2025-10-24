import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

export default function Layout({ children, showNavigation = true }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada exitosamente');
    navigate('/login');
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleHome = () => {
    navigate('/dashboard');
  };

  const isLoginPage = location.pathname === '/login';
  const isRegisterFlow = ['/register', '/verify', '/register-success'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {showNavigation && user && !isLoginPage && !isRegisterFlow && (
        <header className="page-header">
          <div className="container-telco py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-telco-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{user.nombre}</h2>
                  <p className="text-sm text-gray-600">{user.rol}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn-telco-outline text-sm px-4 py-2"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer Navigation */}
      {showNavigation && user && !isLoginPage && !isRegisterFlow && location.pathname !== '/dashboard' && (
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="container-telco">
            <div className="flex justify-between">
              <button onClick={handleBack} className="btn-telco-outline text-sm px-6 py-2">
                Atrás
              </button>
              <button onClick={handleHome} className="btn-telco-primary text-sm px-6 py-2">
                Inicio
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
