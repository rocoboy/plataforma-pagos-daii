import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();

  // Debug logging to understand what's happening
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
    // If loading is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      // Redirect to our custom login page
      window.location.href = '/login';
      return;
    }

    // If user is authenticated but doesn't have admin role when required
    if (!isLoading && isAuthenticated && requireAdmin && !isAdmin) {
      // Redirect to access denied page
      window.location.href = '/access-denied';
      return;
    }
  }, [isLoading, isAuthenticated, requireAdmin, isAdmin]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Verificando autenticación...
        </Typography>
      </Box>
    );
  }

  // Show access denied for admin-only areas
  if (isAuthenticated && requireAdmin && !isAdmin) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          gap: 2,
          px: 3
        }}
      >
        <Typography variant="h4" color="error" gutterBottom>
          Acceso Denegado
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          No tienes permisos suficientes para acceder a esta sección.
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Rol actual: {user?.role || 'Desconocido'}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Rol requerido: Administrador
        </Typography>
      </Box>
    );
  }

  // If user is not authenticated, show loading until redirect happens
  if (!isAuthenticated) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Redirigiendo al portal de login...
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Serás redirigido automáticamente al portal de autenticación central.
        </Typography>
      </Box>
    );
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default AuthGuard;