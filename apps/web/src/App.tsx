import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import TransactionsScreen from './components/TransactionsScreen';
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
  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-white min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-3xl font-bold text-gray-900">Desarrollo de Apps II - Grupo 7</h1>
            <p className="text-gray-600 font-normal mt-2">Sistema de gestión de pagos - Módulo Pagos y Facturación</p>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <TransactionsScreen />
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-12">
          <div className="container mx-auto px-6 text-center">
            <p className="font-medium">Plataforma de Pagos DAII - 2C2025</p>
            <p className="text-sm opacity-80 mt-2">Sistema de gestión de pagos para la asignatura</p>
          </div>
        </footer>
      </div>
      
      {/* React Query DevTools - only in development */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
