import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { muiTheme } from '../theme/muiTheme';
import App from '../App';

// Mock the API interceptor
jest.mock('../lib/apiInterceptorV2', () => ({
  initializeApiInterceptorV2: jest.fn()
}));

// Mock React Query DevTools
jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => <div data-testid="react-query-devtools" />
}));

// Mock AuthContext
jest.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
    logout: jest.fn()
  })
}));

// Mock AuthGuard
jest.mock('../components/AuthGuard', () => {
  return function MockAuthGuard({ children }: { children: React.ReactNode }) {
    return <div data-testid="auth-guard">{children}</div>;
  };
});

// Mock all page components
jest.mock('../pages/Login', () => {
  return function MockLoginPage() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

jest.mock('../pages/Transactions', () => {
  return function MockTransactionsPage() {
    return <div data-testid="transactions-page">Transactions Page</div>;
  };
});

jest.mock('../pages/TransactionDetail', () => {
  return function MockTransactionDetailPage() {
    return <div data-testid="transaction-detail-page">Transaction Detail Page</div>;
  };
});

jest.mock('../pages/DevPaymentCreator', () => {
  return function MockDevPaymentCreator() {
    return <div data-testid="dev-payment-creator">Dev Payment Creator</div>;
  };
});

jest.mock('../pages/AccessDeniedPage', () => {
  return function MockAccessDeniedPage() {
    return <div data-testid="access-denied-page">Access Denied Page</div>;
  };
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={muiTheme}>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    // Mock console.log to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    expect(screen.getByText('Desarrollo de Apps II - Grupo 7')).toBeInTheDocument();
  });

  it('renders header with correct title and description', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    expect(screen.getByText('Desarrollo de Apps II - Grupo 7')).toBeInTheDocument();
    expect(screen.getByText('Sistema de gestión de pagos - Módulo Pagos y Facturación')).toBeInTheDocument();
  });

  it('renders development status badge', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    expect(screen.getByText('En Desarrollo')).toBeInTheDocument();
  });

  it('renders footer with correct information', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    expect(screen.getByText('Plataforma de Pagos DAII - 2C2025')).toBeInTheDocument();
    expect(screen.getByText('Sistema de gestión de pagos')).toBeInTheDocument();
  });

  it('renders AuthProvider wrapper', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
  });

  it('renders React Query DevTools in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('react-query-devtools')).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('does not render React Query DevTools in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    expect(screen.queryByTestId('react-query-devtools')).not.toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('initializes API interceptor on mount', () => {
    const { initializeApiInterceptorV2 } = require('../lib/apiInterceptorV2');
    
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    expect(initializeApiInterceptorV2).toHaveBeenCalled();
  });

  it('logs application start message', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    expect(consoleSpy).toHaveBeenCalledWith('🚀 Application started with API interceptor V2 enabled');
  });
});



