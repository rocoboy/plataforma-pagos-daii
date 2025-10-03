import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { muiTheme } from './theme/muiTheme';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/AuthGuard';
import LoginPage from './pages/Login';
import CustomLoginPage from './pages/CustomLogin';
import TransactionsPage from './pages/Transactions';
import TransactionDetailPage from './pages/TransactionDetail';
import DevPaymentCreator from './pages/DevPaymentCreator';
import AccessDeniedPage from './pages/AccessDeniedPage';
import { initializeApiInterceptorV2 } from './lib/apiInterceptorV2';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  // Initialize API interceptor on app startup
  useEffect(() => {
    initializeApiInterceptorV2();
    console.log('🚀 Application started with API interceptor V2 enabled');
  }, []);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
        
        {/* React Query DevTools - only in development */}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const location = useLocation();
  
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Desarrollo de Apps II - Grupo 7</h1>
            <p className="text-gray-600 font-normal mt-2">Sistema de gestión de pagos - Módulo Pagos y Facturación</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              En Desarrollo
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Routes>
          <Route path="/login" element={<CustomLoginPage />} />
          <Route path="/login-old" element={<LoginPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          <Route path="/payments" element={
            <AuthGuard>
              <TransactionsPage />
            </AuthGuard>
          } />
          <Route path="/payments/:transactionId" element={
            <AuthGuard>
              <TransactionDetailPage />
            </AuthGuard>
          } />
          <Route path="/dev/create-payment" element={
            <AuthGuard requireAdmin={true}>
              <DevPaymentCreator />
            </AuthGuard>
          } />
          {/* Only redirect to payments if not on login-related pages */}
          {!location.pathname.startsWith('/login') && !location.pathname.startsWith('/access-denied') && (
            <Route path="*" element={<Navigate to="/payments" replace />} />
          )}
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="px-6 text-center">
          <p className="font-medium">Plataforma de Pagos DAII - 2C2025</p>
          <p className="text-sm opacity-80 mt-2">Sistema de gestión de pagos</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
