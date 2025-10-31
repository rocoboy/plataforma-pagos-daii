import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => jest.fn(),
}), { virtual: true });

// Mock auth
jest.mock('../lib/auth', () => ({
  getStoredToken: jest.fn(() => null),
  getStoredUser: jest.fn(() => null),
  isAuthenticated: jest.fn(() => false),
  isAdmin: jest.fn(() => false),
  clearAuthData: jest.fn(),
  storeAuthData: jest.fn(),
  checkUrlForToken: jest.fn(() => null),
  handleAuthCallback: jest.fn(() => null),
}));

const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{auth.isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="loading">{auth.isLoading ? 'yes' : 'no'}</span>
      <span data-testid="admin">{auth.isAdmin ? 'yes' : 'no'}</span>
    </div>
  );
};

describe('AuthContext - Extra Coverage', () => {
  it('provides default values', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('authenticated')).toHaveTextContent('no');
  });

  it('provides loading state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('provides admin state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('admin')).toHaveTextContent('no');
  });

  it('renders children', () => {
    render(
      <AuthProvider>
        <div data-testid="child">Child Content</div>
      </AuthProvider>
    );
    
    expect(screen.getByTestId('child')).toHaveTextContent('Child Content');
  });

  it('can be rendered multiple times', () => {
    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    rerender(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('authenticated')).toBeInTheDocument();
  });
});

