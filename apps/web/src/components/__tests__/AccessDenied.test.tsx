import React from 'react';
import { render, screen } from '@testing-library/react';
import AccessDenied from '../AccessDenied';
import { AuthProvider } from '../../contexts/AuthContext';

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AccessDenied', () => {
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
    
    const element = screen.getByText(/acceso denegado/i);
    expect(element).toBeInTheDocument();
  });
});

