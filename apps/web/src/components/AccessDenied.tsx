import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { Block as BlockIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const AccessDenied: React.FC = () => {
  const { logout } = useAuth();

  // Handle logout functionality
  const handleLogout = () => {
    logout();
    // Redirect to our custom login page
    window.location.href = '/login';
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          textAlign: 'center',
          py: 6
        }}
      >
        <BlockIcon 
          sx={{ 
            fontSize: 80, 
            color: 'error.main',
            mb: 3
          }} 
        />
        
        <Typography 
          variant="h3" 
          component="h1" 
          color="error.main"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          Acceso Denegado
        </Typography>
        
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ mb: 3, maxWidth: '400px' }}
        >
          No tenés permisos suficientes para acceder a esta funcionalidad.
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.disabled"
          sx={{ fontStyle: 'italic', mb: 4 }}
        >
          Contacta al administrador si crees que esto es un error.
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ 
            textTransform: 'none',
            fontWeight: 600,
            minWidth: '200px',
            backgroundColor: 'error.main',
            '&:hover': {
              backgroundColor: 'error.dark'
            }
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Container>
  );
};

export default AccessDenied;