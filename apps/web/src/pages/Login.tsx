import React, { useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, CircularProgress } from '@mui/material';
import { Login as LoginIcon, Security as SecurityIcon } from '@mui/icons-material';
import { createLoginRedirectUrl } from '../lib/auth';

const LoginPage: React.FC = () => {
  const handleLogin = () => {
    const loginUrl = createLoginRedirectUrl();
    window.location.href = loginUrl;
  };

  // Auto-redirect to login if this page is accessed directly
  useEffect(() => {
    // Small delay to show the page briefly before redirecting
    const timer = setTimeout(() => {
      handleLogin();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        px: 2
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h4" component="h1" gutterBottom>
            Acceso a la Consola
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Para acceder a la consola de administración, necesitas autenticarte 
            a través del portal central de usuarios.
          </Typography>
          
          <Box sx={{ my: 3 }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Redirigiendo automáticamente...
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            onClick={handleLogin}
            fullWidth
            sx={{ mt: 2 }}
          >
            Ir al Portal de Login
          </Button>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
            Serás redirigido a: grupo5-usuarios.vercel.app
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;