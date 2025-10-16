import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../../pages/Login';

// Mock window.location
delete (window as any).location;
window.location = { href: '' } as any;

describe('LoginPage', () => {
  it('renders login page', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Acceso a la Consola')).toBeInTheDocument();
    expect(screen.getByText(/para acceder a la consola de administración/i)).toBeInTheDocument();
  });

  it('shows login button', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Ir al Portal de Login')).toBeInTheDocument();
  });

  it('handles login button click', () => {
    render(<LoginPage />);
    
    const loginButton = screen.getByText('Ir al Portal de Login');
    fireEvent.click(loginButton);
    
    // Should redirect to login portal
    expect(window.location.href).toContain('/login');
  });

  it('shows loading state', () => {
    render(<LoginPage />);
    
    expect(screen.getByText('Redirigiendo automáticamente...')).toBeInTheDocument();
    expect(screen.getByText('Redirigiendo al servicio de autenticación...')).toBeInTheDocument();
  });
});
