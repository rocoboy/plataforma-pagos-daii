import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Flight as FlightIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CustomLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Track loading and error; no need for extra attempt flag

  // Prevent unwanted redirects when on login page
  useEffect(() => {
    console.log('🔒 Login page mounted, preventing auto-redirects');
    
    // Override any navigation attempts while we're actively trying to login
    const handlePopState = (e: PopStateEvent) => {
      if (loading) {
        console.log('🚫 Preventing navigation during login attempt');
        e.preventDefault();
        window.history.pushState(null, '', '/login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Form submitted, preventing default...');
    setLoading(true);
    setError('');

    try {
      // Llamada a nuestro backend proxy (evita problemas de CORS)
      const apiUrl = process.env.REACT_APP_VERCEL_API || 'http://localhost:3000';
      console.log('📡 Making API call to:', `${apiUrl}/api/auth/login`);
      
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      });

      console.log('📥 Response received:', { 
        status: response.status, 
        ok: response.ok,
        statusText: response.statusText 
      });

      const data: any = await response.json();

      // --- Normalize token & user from various possible shapes ---
      const resolvedToken: string | undefined = data?.token 
        || data?.accessToken 
        || data?.jwt 
        || data?.data?.token;

      let resolvedUser: any = data?.user 
        || data?.usuario 
        || data?.data?.user 
        || data?.data?.usuario;

      // Fallback: if user missing but token present, try to decode JWT payload (no verification)
      const decodeJwt = (token: string): any | null => {
        try {
          const parts = token.split('.');
          if (parts.length !== 3) return null;
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
          const json = atob(padded);
          return JSON.parse(json);
        } catch {
          return null;
        }
      };

      if (!resolvedUser && resolvedToken) {
        const payload = decodeJwt(resolvedToken);
        if (payload) {
          resolvedUser = {
            id: payload.id || payload.user_id || payload.sub || 'unknown',
            email: payload.email || payload.correo || '',
            name: payload.name || payload.nombre || '',
            role: payload.role || payload.rol || 'Usuario',
          };
        }
      }

      const httpOk = response.ok;
      const normalizedSuccess = Boolean(httpOk && resolvedToken && resolvedUser);

      if (normalizedSuccess) {
        // Login exitoso - usar nuestro sistema de auth existente
        console.log('🎉 Login exitoso (normalizado):', { token: !!resolvedToken, user: resolvedUser });
        
        // Guardar en nuestro sistema de autenticación usando el contexto
        login(resolvedToken!, resolvedUser);
        console.log('✅ Usuario autenticado, rol:', resolvedUser.role);
        console.log('🔍 Datos completos del usuario:', resolvedUser);
        
        // Guardar referencia al usuario para evitar problemas de tipado
        const authenticatedUser = resolvedUser as { role: string };
        
        // Pequeña demora para asegurar que el contexto se actualice
        setTimeout(() => {
          // Redirección basada en rol usando React Router (preservando la lógica del middleware)
          if (authenticatedUser.role === 'Administrador') {
            console.log('🚀 Redirigiendo administrador a /payments');
            navigate('/payments', { replace: true });
          } else {
            console.log('🚀 Redirigiendo usuario a /payments');
            navigate('/payments', { replace: true });
          }
        }, 100);
      } else {
        // Error de autenticación: mostrar mensaje apropiado según el tipo de error
        const message: string = data?.message || data?.mensaje || 'Error de autenticación';
        console.error('❌ Error de login:', { httpOk, message, data, status: response.status });
        
        // Determinar el mensaje de error apropiado
        let errorMessage = message;
        
        console.log('🔍 Determining error message for status:', response.status);
        
        if (response.status === 401 || response.status === 403) {
          // Credenciales incorrectas
          errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
          console.log('🔒 Setting credentials error message');
        } else if (/exitoso/i.test(message) && httpOk) {
          // Si llega un mensaje "Login exitoso" pero faltaron campos, informar más detallado
          errorMessage = 'Error en la respuesta de autenticación. Intenta nuevamente.';
          console.log('⚠️ Setting response format error message');
        } else if (response.status >= 500) {
          // Error del servidor
          errorMessage = 'Error del servidor. Intenta nuevamente más tarde.';
          console.log('🖥️ Setting server error message');
        } else if (!httpOk && !message) {
          // Error genérico sin mensaje específico
          errorMessage = 'Error de autenticación. Verifica tus credenciales.';
          console.log('❓ Setting generic error message');
        }
        
        console.log('📝 Final error message:', errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error de red:', error);
      setError('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 3
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 5 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <FlightIcon 
                sx={{ 
                  fontSize: 48, 
                  color: 'primary.main', 
                  mb: 2 
                }} 
              />
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{ fontWeight: 'bold', color: 'text.primary' }}
              >
                Skytracker
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Dashboard de Pagos
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
              >
                Ingresa tus credenciales para acceder
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3 }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box 
              component="form" 
              onSubmit={handleSubmit}
              noValidate
            >
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                placeholder="tu@email.com"
              />

              <TextField
                fullWidth
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder="Tu contraseña"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !email || !password}
                onClick={(e) => {
                  // Extra prevention in case form submit doesn't work
                  if (!email || !password) {
                    e.preventDefault();
                  }
                }}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Sistema de gestión de pagos - Skytracker
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                DAII - Grupo 7 © 2025
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default CustomLoginPage;