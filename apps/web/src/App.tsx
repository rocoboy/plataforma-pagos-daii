import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Switch, FormControlLabel, Tooltip } from '@mui/material';
import { muiTheme } from './theme/muiTheme';
import Navigation from './components/Navigation';
import { 
  TransactionsScreen, 
  TransactionDetailScreen,
  PaymentsListPage, 
  CreatePaymentPage, 
  PaymentDetailPage, 
  EditPaymentPage 
} from './pages';
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
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  const handleViewDetail = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
  };

  const handleBackToTransactions = () => {
    setSelectedTransactionId(null);
  };

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="bg-white min-h-screen">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Desarrollo de Apps II - Grupo 7
                    {isAdminMode && (
                      <span className="ml-3 text-lg text-blue-600 font-semibold">
                        - Gestión de Pagos (Admin)
                      </span>
                    )}
                  </h1>
                  <p className="text-gray-600 font-normal mt-2">
                    {isAdminMode 
                      ? "Sistema de gestión de pagos - Módulo Pagos y Facturación" 
                      : "Historial de Transacciones - Consulta de operaciones"
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Tooltip title="Activar/Desactivar modo administrador">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isAdminMode}
                          onChange={toggleAdminMode}
                          color="primary"
                        />
                      }
                      label="Admin"
                      labelPlacement="start"
                    />
                  </Tooltip>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    En Desarrollo
                  </span>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main>
              {isAdminMode && <Navigation />}
              <Routes>
                {/* Default route - depends on admin mode */}
                <Route 
                  path="/" 
                  element={
                    isAdminMode ? 
                      <Navigate to="/payments" replace /> : 
                      <Navigate to="/transactions" replace />
                  } 
                />
                
                {/* Payment routes - only available in admin mode */}
                {isAdminMode && (
                  <>
                    <Route path="/payments" element={<PaymentsListPage />} />
                    <Route path="/payments/create" element={<CreatePaymentPage />} />
                    <Route path="/payments/:id" element={<PaymentDetailPage />} />
                    <Route path="/payments/:id/edit" element={<EditPaymentPage />} />
                  </>
                )}
                
                {/* Transaction routes - always available (Historial de Transacciones) */}
                <Route 
                  path="/transactions" 
                  element={
                    selectedTransactionId ? (
                      <TransactionDetailScreen 
                        transactionId={selectedTransactionId}
                        onBack={handleBackToTransactions}
                      />
                    ) : (
                      <TransactionsScreen onViewDetail={handleViewDetail} />
                    )
                  } 
                />
                
                {/* Catch all route - depends on admin mode */}
                <Route 
                  path="*" 
                  element={
                    isAdminMode ? 
                      <Navigate to="/payments" replace /> : 
                      <Navigate to="/transactions" replace />
                  } 
                />
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
          
          {/* React Query DevTools - only in development */}
          {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
