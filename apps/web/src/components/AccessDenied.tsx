import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { ShieldX, LogOut } from 'lucide-react';

const AccessDenied: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center py-12 px-4">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <ShieldX className="w-10 h-10 text-gray-900" />
      </div>
      
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Acceso Denegado
      </h1>
      
      <p className="text-lg text-muted-foreground mb-6 max-w-md">
        No tenés permisos suficientes para acceder a esta funcionalidad.
      </p>
      
      <p className="text-sm text-muted-foreground italic mb-8">
        Contacta al administrador si crees que esto es un error.
      </p>

      <Button
        size="lg"
        onClick={handleLogout}
        className="min-w-[200px] bg-black hover:bg-gray-800"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar Sesión
      </Button>
    </div>
  );
};

export default AccessDenied;
