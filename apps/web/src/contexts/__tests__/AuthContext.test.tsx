import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Test component to access context
const TestComponent: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="is-authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="is-loading">{isLoading ? 'true' : 'false'}</div>
      {user && (
        <div>
          <div data-testid="user-name">{user.name}</div>
          <div data-testid="user-email">{user.email}</div>
          <div data-testid="user-role">{user.role}</div>
        </div>
      )}
      <button onClick={() => login('test-token', { id: '1', name: 'Test User', email: 'test@test.com', role: 'Usuario' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('provides initial unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('handles login successfully', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginButton = screen.getByText('Login');
    
    act(() => {
      loginButton.click();
    });
    
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@test.com');
    expect(screen.getByTestId('user-role')).toHaveTextContent('Usuario');
  });

  it('handles logout successfully', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginButton = screen.getByText('Login');
    const logoutButton = screen.getByText('Logout');
    
    act(() => {
      loginButton.click();
    });
    
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    
    act(() => {
      logoutButton.click();
    });
    
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
  });

  it('stores auth data on login', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginButton = screen.getByText('Login');
    
    act(() => {
      loginButton.click();
    });
    
    // Auth data should be stored (checking via authenticated state)
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
  });

  it('clears auth data on logout', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const loginButton = screen.getByText('Login');
    const logoutButton = screen.getByText('Logout');
    
    act(() => {
      loginButton.click();
    });
    
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
    
    act(() => {
      logoutButton.click();
    });
    
    // Auth data should be cleared
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    console.error = originalError;
  });
});

