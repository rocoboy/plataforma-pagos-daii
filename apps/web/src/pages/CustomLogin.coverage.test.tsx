import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CustomLoginPage from './CustomLogin';

// Mock AuthContext
const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
  MemoryRouter: ({ children }: { children: React.ReactNode }) => children,
}), { virtual: true });

// Mock fetch
global.fetch = jest.fn();

// Mock window.location
delete (window as any).location;
(window as any).location = { href: '' };

// Mock window.history
const mockPushState = jest.fn();
window.history.pushState = mockPushState;

// Mock window.addEventListener and removeEventListener
const eventListeners: { [key: string]: EventListener[] } = {};
window.addEventListener = jest.fn((event: string, listener: EventListener) => {
  if (!eventListeners[event]) {
    eventListeners[event] = [];
  }
  eventListeners[event].push(listener);
});

window.removeEventListener = jest.fn((event: string, listener: EventListener) => {
  if (eventListeners[event]) {
    eventListeners[event] = eventListeners[event].filter(l => l !== listener);
  }
});

describe('CustomLogin - Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockClear();
    mockNavigate.mockClear();
    mockPushState.mockClear();
    (global.fetch as jest.Mock).mockClear();
    eventListeners['popstate'] = [];
  });

  it('renders login form', () => {
    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    // Check for heading text instead of generic text query (avoids multiple matches)
    const headings = screen.getAllByText(/iniciar sesión/i);
    expect(headings.length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('handles successful login with token and user', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        token: 'mock-token',
        user: { id: '1', email: 'test@test.com', name: 'Test User', role: 'Usuario' }
      })
    });

    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('mock-token', expect.objectContaining({
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
        role: 'Usuario'
      }));
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/payments', { replace: true });
    }, { timeout: 200 });
  });

  it('handles login with accessToken instead of token', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        accessToken: 'mock-access-token',
        user: { id: '1', email: 'test@test.com', role: 'Usuario' }
      })
    });

    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('mock-access-token', expect.any(Object));
    });
  });

  it('handles login with jwt field instead of token', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        jwt: 'mock-jwt-token',
        user: { id: '1', email: 'test@test.com', role: 'Usuario' }
      })
    });

    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('mock-jwt-token', expect.any(Object));
    });
  });

  it('handles login with usuario instead of user', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        token: 'mock-token',
        usuario: { id: '1', email: 'test@test.com', rol: 'Admin' }
      })
    });

    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('handles login with data.user nested object', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        token: 'mock-token',
        data: {
          user: { id: '1', email: 'test@test.com', role: 'Usuario' }
        }
      })
    });

    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('handles login with JWT token decoding when user is missing', async () => {
    // Create a valid JWT token
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      id: 'jwt-id',
      email: 'jwt@email.com',
      nombre: 'JWT Name',
      rol: 'Usuario'
    }));
    const jwtToken = `${header}.${payload}.signature`;

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        token: jwtToken
      })
    });

    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('handles failed login with 401 status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        message: 'Invalid credentials'
      })
    });

    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });

  it('handles failed login with 403 status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({
        success: false,
        message: 'Forbidden'
      })
    });

    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });

  it('handles failed login with 500 status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        message: 'Internal Server Error'
      })
    });

    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error del servidor/i)).toBeInTheDocument();
    });
  });

  it('handles network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error de conexión/i)).toBeInTheDocument();
    });
  });

  it('handles password visibility toggle', () => {
    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText(/contraseña/i) as HTMLInputElement;
    const toggleButton = passwordInput.parentElement?.querySelector('button');

    expect(passwordInput.type).toBe('password');

    if (toggleButton) {
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('text');

      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    }
  });

  it('disables submit button when email or password is empty', () => {
    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    expect(submitButton).toBeDisabled();

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    expect(submitButton).toBeDisabled();

    const passwordInput = screen.getByLabelText(/contraseña/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(submitButton).not.toBeDisabled();
  });

  it('handles login with message containing "exitoso" but httpOk is true', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: false,
        message: 'Login exitoso pero falta token',
        token: null
      })
    });

    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error en la respuesta de autenticación/i)).toBeInTheDocument();
    });
  });

  it('handles login with no message and httpOk is false', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({})
    });

    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error de autenticación/i)).toBeInTheDocument();
    });
  });

  it('handles login with mensaje field', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        mensaje: 'Credenciales inválidas'
      })
    });

    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during login', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          token: 'mock-token',
          user: { id: '1', email: 'test@test.com', role: 'Usuario' }
        })
      }), 100))
    );

    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/iniciando sesión/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('trims email input', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        token: 'mock-token',
        user: { id: '1', email: 'test@test.com', role: 'Usuario' }
      })
    });

    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <CustomLoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: '  test@test.com  ' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"email":"test@test.com"')
        })
      );
    });
  });
});
