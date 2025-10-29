import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CustomLoginPage from '../../pages/CustomLogin';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock fetch
global.fetch = jest.fn();

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock AuthContext
const mockLogin = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mock jsPDF
jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    setFont: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    text: jest.fn(),
    save: jest.fn(),
  })),
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CustomLoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    mockNavigate.mockClear();
    mockLogin.mockClear();
  });

  describe('Rendering', () => {
    it('should render login form with all elements', () => {
      renderWithProviders(<CustomLoginPage />);

      expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
      expect(screen.getByText('Ingresa tus credenciales')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    });

    it('should render password visibility toggle', () => {
      renderWithProviders(<CustomLoginPage />);

      const passwordInput = screen.getByLabelText('Contraseña');
      const toggleButton = passwordInput.parentElement?.querySelector('button');
      
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('type', 'button');
    });

    it('should disable submit button when form is empty', () => {
      renderWithProviders(<CustomLoginPage />);

      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when form is filled', () => {
      renderWithProviders(<CustomLoginPage />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Form Interactions', () => {
    it('should update email input value', () => {
      renderWithProviders(<CustomLoginPage />);

      const emailInput = screen.getByLabelText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should update password input value', () => {
      renderWithProviders(<CustomLoginPage />);

      const passwordInput = screen.getByLabelText('Contraseña');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput).toHaveValue('password123');
    });

    it('should toggle password visibility', () => {
      renderWithProviders(<CustomLoginPage />);

      const passwordInput = screen.getByLabelText('Contraseña');
      const toggleButton = passwordInput.parentElement?.querySelector('button');

      expect(passwordInput).toHaveAttribute('type', 'password');
      
      fireEvent.click(toggleButton!);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      fireEvent.click(toggleButton!);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should trim email input on submit', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test-token', user: { id: '1', email: 'test@example.com' } }),
      });

      renderWithProviders(<CustomLoginPage />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

      fireEvent.change(emailInput, { target: { value: '  test@example.com  ' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/login'),
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'test@example.com', // Should be trimmed
              password: 'password123'
            })
          })
        );
      });
    });
  });

  describe('Form Submission', () => {
    it('should show loading state during submission', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderWithProviders(<CustomLoginPage />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should handle successful login with token and user', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ 
          token: 'test-token', 
          user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'admin' } 
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      renderWithProviders(<CustomLoginPage />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test-token', {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin'
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/payments', { replace: true });
      });
    });

    it('should handle successful login with different response formats', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ 
          accessToken: 'test-token', 
          usuario: { id: '1', correo: 'test@example.com', nombre: 'Test User', rol: 'admin' } 
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      renderWithProviders(<CustomLoginPage />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test-token', {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin'
        });
      });
    });

    it('should handle JWT token decoding when user data is missing', async () => {
      const mockJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwicm9sZSI6ImFkbWluIn0.signature';
      
      const mockResponse = {
        ok: true,
        json: async () => ({ token: mockJWT }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Mock atob for JWT decoding
      const originalAtob = global.atob;
      global.atob = jest.fn((str) => {
        if (str === 'eyJpZCI6IjEiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwicm9sZSI6ImFkbWluIn0') {
          return '{"id":"1","email":"test@example.com","name":"Test User","role":"admin"}';
        }
        return originalAtob(str);
      });

      renderWithProviders(<CustomLoginPage />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(mockJWT, {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin'
        });
      });

      global.atob = originalAtob;
    });

    it('should handle 401 error with appropriate message', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid credentials' }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      renderWithProviders(<CustomLoginPage />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Credenciales inválidas. Verifica tu email y contraseña.')).toBeInTheDocument();
      });
    });

    it('should handle 500 error with appropriate message', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      renderWithProviders(<CustomLoginPage />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error del servidor. Intenta nuevamente más tarde.')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<CustomLoginPage />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error de conexión. Verifica tu internet e inténtalo de nuevo.')).toBeInTheDocument();
      });
    });

    it('should handle malformed response', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ invalid: 'response' }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      renderWithProviders(<CustomLoginPage />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error de autenticación. Verifica tus credenciales.')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Prevention', () => {
    it('should prevent navigation during login attempt', () => {
      const mockPushState = jest.fn();
      const mockAddEventListener = jest.spyOn(window, 'addEventListener');
      const mockRemoveEventListener = jest.spyOn(window, 'removeEventListener');

      renderWithProviders(<CustomLoginPage />);

      expect(mockAddEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));

      // Simulate popstate event during loading
      const popstateHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'popstate'
      )?.[1] as EventListener;

      if (popstateHandler) {
        const mockEvent = new PopStateEvent('popstate');
        Object.defineProperty(mockEvent, 'preventDefault', { value: jest.fn() });
        
        popstateHandler(mockEvent);
      }

      // Cleanup
      expect(mockRemoveEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
    });
  });

  describe('Environment Configuration', () => {
    it('should use default API URL when REACT_APP_AUTH_SERVICE_URL is not set', async () => {
      const originalEnv = process.env.REACT_APP_AUTH_SERVICE_URL;
      delete process.env.REACT_APP_AUTH_SERVICE_URL;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test-token', user: { id: '1' } }),
      });

      renderWithProviders(<CustomLoginPage />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/auth/login',
          expect.any(Object)
        );
      });

      process.env.REACT_APP_AUTH_SERVICE_URL = originalEnv;
    });
  });
});
