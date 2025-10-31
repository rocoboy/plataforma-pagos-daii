import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();

  // Debug logging
  React.useEffect(() => {
    console.log('🛡️ AuthGuard Debug:', {
      isLoading,
      isAuthenticated,
      isAdmin,
      requireAdmin,
      userRole: user?.role,
      userName: user?.name
    });
  }, [isLoading, isAuthenticated, isAdmin, requireAdmin, user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    if (!isLoading && isAuthenticated && requireAdmin && !isAdmin) {
      window.location.href = '/access-denied';
      return;
    }
  }, [isLoading, isAuthenticated, requireAdmin, isAdmin]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-gray-900" />
        <p className="text-lg text-muted-foreground">Verificando autenticación...</p>
      </div>
    );
  }

  // Show access denied for admin-only areas
  if (isAuthenticated && requireAdmin && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <h1 className="text-3xl font-bold text-gray-900">Acceso Denegado</h1>
        <p className="text-center text-muted-foreground">
          No tienes permisos suficientes para acceder a esta sección.
        </p>
        <p className="text-sm text-muted-foreground">Rol actual: {user?.role || 'Desconocido'}</p>
        <p className="text-sm text-muted-foreground">Rol requerido: Administrador</p>
      </div>
    );
  }

  // If user is not authenticated, show loading until redirect happens
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-gray-900" />
        <p className="text-lg text-muted-foreground">Redirigiendo al portal de login...</p>
        <p className="text-sm text-center text-muted-foreground max-w-md">
          Serás redirigido automáticamente al portal de autenticación central.
        </p>
      </div>
    );
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default AuthGuard;
