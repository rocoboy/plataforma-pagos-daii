import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      
      {/* React Query DevTools - only in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

function AppContent() {
  const location = useLocation();
  
  return (
    <div className="bg-white min-h-screen">

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
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="px-6 text-center">
          <p className="text-sm text-gray-600">© 2025</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
