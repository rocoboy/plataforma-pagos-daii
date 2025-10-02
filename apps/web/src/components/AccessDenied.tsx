import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';

const AccessDenied: React.FC = () => {
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
          No tienes permisos suficientes para acceder a esta funcionalidad.
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.disabled"
          sx={{ fontStyle: 'italic' }}
        >
          Contacta al administrador si crees que esto es un error.
        </Typography>
      </Box>
    </Container>
  );
};

export default AccessDenied;