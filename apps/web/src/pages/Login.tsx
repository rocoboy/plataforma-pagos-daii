import React, { useEffect } from 'react';
import { createLoginRedirectUrl } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Shield, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const handleLogin = () => {
    const loginUrl = createLoginRedirectUrl();
    window.location.href = loginUrl;
  };

  // Auto-redirect to login if this page is accessed directly
  useEffect(() => {
    const timer = setTimeout(() => {
      handleLogin();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Acceso a la Consola</CardTitle>
          <CardDescription>
            Para acceder a la consola de administración, necesitas autenticarte 
            a través del portal central de usuarios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-sm">Redirigiendo automáticamente...</p>
          </div>
          
          <Button
            onClick={handleLogin}
            className="w-full"
            size="lg"
          >
            Ir al Portal de Login
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Redirigiendo al servicio de autenticación...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
