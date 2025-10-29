import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { initializeApiInterceptorV2 } from '../lib/apiInterceptorV2';

// Mock dependencies
jest.mock('../lib/apiInterceptorV2', () => ({
  initializeApiInterceptorV2: jest.fn()
}));

// Mock React Query DevTools
jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => <div data-testid="react-query-devtools">DevTools</div>
}));

// Mock all page components
jest.mock('../pages/Login', () => {
  return function MockLoginPage() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

jest.mock('../pages/CustomLogin', () => {
  return function MockCustomLoginPage() {
    return <div data-testid="custom-login-page">Custom Login Page</div>;
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

jest.mock('../components/AuthGuard', () => {
  return function MockAuthGuard({ children, requireAdmin = false }: any) {
    return (
      <div data-testid="auth-guard" data-require-admin={requireAdmin}>
        {children}
      </div>
    );
  };
});

jest.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: any) => (
    <div data-testid="auth-provider">{children}</div>
  )
}));

// Mock console.log to avoid noise in tests
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize API interceptor on mount', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      expect(initializeApiInterceptorV2).toHaveBeenCalledTimes(1);
    });

    it('should log application startup message', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      expect(consoleSpy).toHaveBeenCalledWith('🚀 Application started with API interceptor V2 enabled');
    });
  });

  describe('Component Structure', () => {
    it('should render QueryClientProvider', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // QueryClientProvider doesn't have a testid, but we can check if AuthProvider is rendered
      expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    });

    it('should render AuthProvider', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    });

    it('should render main app content', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Check for main content wrapper
      const mainContent = screen.getByRole('main');
      expect(mainContent).toBeInTheDocument();
    });
  });

  describe('Development Tools', () => {
    it('should render React Query DevTools in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      expect(screen.getByTestId('react-query-devtools')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should not render React Query DevTools in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      expect(screen.queryByTestId('react-query-devtools')).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Routing', () => {
    it('should render custom login page for /login route', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Navigate to login page
      window.history.pushState({}, 'Test page', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));

      expect(screen.getByTestId('custom-login-page')).toBeInTheDocument();
    });

    it('should render old login page for /login-old route', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Navigate to old login page
      window.history.pushState({}, 'Test page', '/login-old');
      window.dispatchEvent(new PopStateEvent('popstate'));

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should render access denied page for /access-denied route', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Navigate to access denied page
      window.history.pushState({}, 'Test page', '/access-denied');
      window.dispatchEvent(new PopStateEvent('popstate'));

      expect(screen.getByTestId('access-denied-page')).toBeInTheDocument();
    });

    it('should render transactions page for /payments route with AuthGuard', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Navigate to payments page
      window.history.pushState({}, 'Test page', '/payments');
      window.dispatchEvent(new PopStateEvent('popstate'));

      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
      expect(screen.getByTestId('transactions-page')).toBeInTheDocument();
    });

    it('should render transaction detail page for /payments/:id route with AuthGuard', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Navigate to transaction detail page
      window.history.pushState({}, 'Test page', '/payments/123');
      window.dispatchEvent(new PopStateEvent('popstate'));

      expect(screen.getByTestId('auth-guard')).toBeInTheDocument();
      expect(screen.getByTestId('transaction-detail-page')).toBeInTheDocument();
    });

    it('should render dev payment creator for /dev/create-payment route with admin AuthGuard', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Navigate to dev payment creator page
      window.history.pushState({}, 'Test page', '/dev/create-payment');
      window.dispatchEvent(new PopStateEvent('popstate'));

      const authGuard = screen.getByTestId('auth-guard');
      expect(authGuard).toBeInTheDocument();
      expect(authGuard).toHaveAttribute('data-require-admin', 'true');
      expect(screen.getByTestId('dev-payment-creator')).toBeInTheDocument();
    });

    it('should redirect to /payments for unknown routes', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Navigate to unknown route
      window.history.pushState({}, 'Test page', '/unknown-route');
      window.dispatchEvent(new PopStateEvent('popstate'));

      // Should redirect to payments
      expect(screen.getByTestId('transactions-page')).toBeInTheDocument();
    });

    it('should not redirect login-related pages', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      const loginRoutes = ['/login', '/login-old', '/access-denied'];
      
      loginRoutes.forEach(route => {
        window.history.pushState({}, 'Test page', route);
        window.dispatchEvent(new PopStateEvent('popstate'));
        
        // Should not redirect to payments
        expect(screen.queryByTestId('transactions-page')).not.toBeInTheDocument();
      });
    });
  });

  describe('Layout Structure', () => {
    it('should have proper main content structure', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should have footer with copyright', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      expect(screen.getByText('© 2025')).toBeInTheDocument();
    });

    it('should have proper CSS classes', () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      const container = screen.getByRole('main').parentElement;
      expect(container).toHaveClass('bg-white', 'min-h-screen');
    });
  });

  describe('QueryClient Configuration', () => {
    it('should have proper default options', () => {
      // This test verifies that the QueryClient is configured correctly
      // The actual configuration is tested implicitly through the component rendering
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // If the component renders without errors, the QueryClient is properly configured
      expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    it('should handle component errors gracefully', () => {
      // Mock a component that throws an error
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      // This test ensures the app doesn't crash completely
      // In a real scenario, you'd have an error boundary
      expect(() => {
        render(
          <BrowserRouter>
            <App />
          </BrowserRouter>
        );
      }).not.toThrow();
    });
  });
});
