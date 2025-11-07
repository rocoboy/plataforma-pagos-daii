import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AuthGuard from '../../components/AuthGuard';

// Mock window.location
const mockLocation = {
  href: '',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

// Mock console.log to avoid noise in tests
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

// Mock AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = require('../../contexts/AuthContext').useAuth;

describe('AuthGuard', () => {
  beforeEach(() => {
    mockLocation.href = '';
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading spinner when authentication is loading', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isAdmin: false,
        isLoading: true,
        user: null,
      });

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      );

      expect(screen.getByText('Verificando autenticación...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated User', () => {
    it('renders children when user is authenticated and no admin required', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isAdmin: false,
        isLoading: false,
        user: { id: '1', email: 'user@test.com', name: 'Test User', role: 'Usuario' },
      });

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('renders children when user is authenticated and is admin', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isAdmin: true,
        isLoading: false,
        user: { id: '1', email: 'admin@test.com', name: 'Admin User', role: 'Administrador' },
      });

      render(
        <AuthGuard requireAdmin={true}>
          <div>Admin Content</div>
        </AuthGuard>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated User', () => {
    it('shows redirect message when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
        user: null,
      });

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      );

      expect(screen.getByText('Redirigiendo al portal de login...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('redirects to login when user is not authenticated', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
        user: null,
      });

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockLocation.href).toBe('/login');
      });
    });
  });

  describe('Admin Authorization', () => {
    it('shows access denied when non-admin tries to access admin area', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isAdmin: false,
        isLoading: false,
        user: { id: '1', email: 'user@test.com', name: 'Test User', role: 'Usuario' },
      });

      render(
        <AuthGuard requireAdmin={true}>
          <div>Admin Content</div>
        </AuthGuard>
      );

      expect(screen.getByText('Acceso Denegado')).toBeInTheDocument();
      expect(screen.getByText(/No tienes permisos suficientes/i)).toBeInTheDocument();
      expect(screen.getByText('Rol actual: Usuario')).toBeInTheDocument();
      expect(screen.getByText('Rol requerido: Administrador')).toBeInTheDocument();
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('redirects to access-denied when non-admin tries to access admin area', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isAdmin: false,
        isLoading: false,
        user: { id: '1', email: 'user@test.com', name: 'Test User', role: 'Usuario' },
      });

      render(
        <AuthGuard requireAdmin={true}>
          <div>Admin Content</div>
        </AuthGuard>
      );

      await waitFor(() => {
        expect(mockLocation.href).toBe('/access-denied');
      });
    });

    it('shows role as "Desconocido" when user has no role', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isAdmin: false,
        isLoading: false,
        user: { id: '1', email: 'user@test.com', name: 'Test User', role: undefined },
      });

      render(
        <AuthGuard requireAdmin={true}>
          <div>Admin Content</div>
        </AuthGuard>
      );

      expect(screen.getByText('Rol actual: Desconocido')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles requireAdmin prop being false explicitly', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isAdmin: false,
        isLoading: false,
        user: { id: '1', email: 'user@test.com', name: 'Test User', role: 'Usuario' },
      });

      render(
        <AuthGuard requireAdmin={false}>
          <div>Regular Content</div>
        </AuthGuard>
      );

      expect(screen.getByText('Regular Content')).toBeInTheDocument();
    });

    it('renders multiple children correctly', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isAdmin: true,
        isLoading: false,
        user: { id: '1', email: 'admin@test.com', name: 'Admin', role: 'Administrador' },
      });

      render(
        <AuthGuard>
          <div>First Child</div>
          <div>Second Child</div>
        </AuthGuard>
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });
  });
});

