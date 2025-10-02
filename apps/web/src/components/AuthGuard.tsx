import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { createLoginRedirectUrl } from '../lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();

  useEffect(() => {
    // If loading is complete and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      // Redirect to external login with current URL as redirect_uri
      const loginUrl = createLoginRedirectUrl();
      window.location.href = loginUrl;
      return;
    }

    // If user is authenticated but doesn't have admin role when required
    if (!isLoading && isAuthenticated && requireAdmin && !isAdmin) {
      // You could redirect to a "Access Denied" page or show an error
      console.error('Access denied: Admin role required');
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