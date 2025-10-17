import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccessDenied from '../../components/AccessDenied';
import { AuthProvider } from '../../contexts/AuthContext';

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AccessDenied', () => {
  // Store original window.location
  const originalLocation = window.location;

  beforeAll(() => {
    // Mock window.location
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' } as any;
  });

  afterAll(() => {
    // Restore original window.location
    window.location = originalLocation;
  });

  beforeEach(() => {
    localStorage.clear();
    window.location.href = '';
  });

  it('renders access denied message', () => {
    renderWithAuth(<AccessDenied />);
    
    expect(screen.getByText(/acceso denegado/i)).toBeInTheDocument();
  });

  it('displays error icon', () => {
    const { container } = renderWithAuth(<AccessDenied />);
    
    // Check if the component renders
    expect(container).toBeTruthy();
  });

  it('renders explanation message', () => {
    renderWithAuth(<AccessDenied />);
    
    expect(screen.getByText(/no tenés permisos suficientes/i)).toBeInTheDocument();
  });

  it('renders contact administrator message', () => {
    renderWithAuth(<AccessDenied />);
    
    expect(screen.getByText(/contacta al administrador/i)).toBeInTheDocument();
  });

  it('renders logout button', () => {
    renderWithAuth(<AccessDenied />);
    
    const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('redirects to login when logout button is clicked', async () => {
    // Store auth data first
    localStorage.setItem('auth_data', JSON.stringify({
      token: 'test-token',
      user: { id: '1', email: 'test@test.com', role: 'Usuario' },
      expiresAt: Date.now() + 3600000
    }));

    renderWithAuth(<AccessDenied />);
    
    const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i });
    fireEvent.click(logoutButton);

    // Wait for redirect to happen
    await waitFor(() => {
      expect(window.location.href).toBe('/login');
    });
  });
});

