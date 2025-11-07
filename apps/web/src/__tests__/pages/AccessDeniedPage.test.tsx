import React from 'react';
import { render, screen } from '@testing-library/react';
import AccessDeniedPage from '../../pages/AccessDeniedPage';
import { AuthProvider } from '../../contexts/AuthContext';

describe('AccessDeniedPage', () => {
  it('renders access denied page', () => {
    render(
      <AuthProvider>
        <AccessDeniedPage />
      </AuthProvider>
    );
    
    expect(screen.getByText(/acceso denegado/i)).toBeInTheDocument();
  });

  it('renders within AuthProvider', () => {
    const { container } = render(
      <AuthProvider>
        <AccessDeniedPage />
      </AuthProvider>
    );
    
    expect(container).toBeTruthy();
  });
});


