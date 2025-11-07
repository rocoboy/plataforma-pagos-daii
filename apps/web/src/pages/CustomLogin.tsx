import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Plane, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';

const CustomLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prevent unwanted redirects when on login page
  useEffect(() => {
    console.log('🔒 Login page mounted, preventing auto-redirects');
    
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
      const apiUrl = process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:3000';
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

      // Normalize token & user from various possible shapes
      const resolvedToken: string | undefined = data?.token 
        || data?.accessToken 
        || data?.jwt 
        || data?.data?.token;

      let resolvedUser: any = data?.user 
        || data?.usuario 
        || data?.data?.user 
        || data?.data?.usuario;

      // Fallback: if user missing but token present, try to decode JWT payload
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
        console.log('🎉 Login exitoso (normalizado):', { token: !!resolvedToken, user: resolvedUser });
        
        login(resolvedToken!, resolvedUser);
        console.log('✅ Usuario autenticado, rol:', resolvedUser.role);
        
        const authenticatedUser = resolvedUser as { role: string };
        
        setTimeout(() => {
          if (authenticatedUser.role === 'Administrador') {
            console.log('🚀 Redirigiendo administrador a /payments');
            navigate('/payments', { replace: true });
          } else {
            console.log('🚀 Redirigiendo usuario a /payments');
            navigate('/payments', { replace: true });
          }
        }, 100);
      } else {
        const message: string = data?.message || data?.mensaje || 'Error de autenticación';
        console.error('❌ Error de login:', { httpOk, message, data, status: response.status });
        
        let errorMessage = message;
        
        if (response.status === 401 || response.status === 403) {
          errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
        } else if (/exitoso/i.test(message) && httpOk) {
          errorMessage = 'Error en la respuesta de autenticación. Intenta nuevamente.';
        } else if (response.status >= 500) {
          errorMessage = 'Error del servidor. Intenta nuevamente más tarde.';
        } else if (!httpOk && !message) {
          errorMessage = 'Error de autenticación. Verifica tus credenciales.';
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error de red:', error);
      setError('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto w-10 h-10 rounded-full flex items-center justify-center">
            <Plane className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription className="text-sm">Ingresa tus credenciales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-4" 
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-center text-xs text-muted-foreground border-t py-3">
          <p>© 2025</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CustomLoginPage;
