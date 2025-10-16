import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Test component to access context
const TestComponent = () => {
  const { user, token, isAuthenticated, isAdmin, login, logout, refreshAuth } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-state">
        <div>User: {user?.name || 'No user'}</div>
        <div>Token: {token ? 'Present' : 'Absent'}</div>
        <div>IsAuth: {isAuthenticated ? 'Yes' : 'No'}</div>
        <div>IsAdmin: {isAdmin ? 'Yes' : 'No'}</div>
      </div>
      <button onClick={() => login('new-token', { id: '1', email: 'test@test.com', role: 'Usuario', name: 'Test' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={refreshAuth}>Refresh</button>
    </div>
  );
};

describe('AuthContext Extended', () => {
  beforeEach(() => {
    localStorage.clear();
    delete (window as any).location;
    (window as any).location = {
      pathname: '/test',
      search: '',
      hash: '',
      href: 'http://localhost:3001/test'
    };
  });

  it('initializes with no auth data', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('User: No user')).toBeInTheDocument();
      expect(screen.getByText('Token: Absent')).toBeInTheDocument();
    });
  });

  it('loads stored auth data on mount', async () => {
    localStorage.setItem('auth_token', 'stored-token');
    localStorage.setItem('auth_user', JSON.stringify({
      token: 'stored-token',
      user: { id: '1', email: 'stored@test.com', role: 'Usuario', name: 'Stored User' },
      expiresAt: Date.now() + 10000
    }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('User: Stored User')).toBeInTheDocument();
      expect(screen.getByText('Token: Present')).toBeInTheDocument();
      expect(screen.getByText('IsAuth: Yes')).toBeInTheDocument();
    });
  });

  it('handles login action', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('User: No user')).toBeInTheDocument();
    });

    const loginButton = screen.getByRole('button', { name: 'Login' });
    act(() => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByText('User: Test')).toBeInTheDocument();
      expect(screen.getByText('Token: Present')).toBeInTheDocument();
    });
  });

  it('handles logout action', async () => {
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_user', JSON.stringify({
      token: 'test-token',
      user: { id: '1', email: 'test@test.com', role: 'Usuario', name: 'Test' },
      expiresAt: Date.now() + 10000
    }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('User: Test')).toBeInTheDocument();
    });

    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    act(() => {
      logoutButton.click();
    });

    await waitFor(() => {
      expect(screen.getByText('User: No user')).toBeInTheDocument();
      expect(screen.getByText('Token: Absent')).toBeInTheDocument();
    });
  });

  it('handles refresh action', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('User: No user')).toBeInTheDocument();
    });

    // Store data after render
    localStorage.setItem('auth_token', 'refreshed-token');
    localStorage.setItem('auth_user', JSON.stringify({
      token: 'refreshed-token',
      user: { id: '1', email: 'refresh@test.com', role: 'Administrador', name: 'Refreshed' },
      expiresAt: Date.now() + 10000
    }));

    const refreshButton = screen.getByRole('button', { name: 'Refresh' });
    act(() => {
      refreshButton.click();
    });

    await waitFor(() => {
      expect(screen.getByText('User: Refreshed')).toBeInTheDocument();
      expect(screen.getByText('IsAdmin: Yes')).toBeInTheDocument();
    });
  });

  it('detects admin role correctly', async () => {
    localStorage.setItem('auth_token', 'admin-token');
    localStorage.setItem('auth_user', JSON.stringify({
      token: 'admin-token',
      user: { id: '1', email: 'admin@test.com', role: 'Administrador', name: 'Admin' },
      expiresAt: Date.now() + 10000
    }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByText('IsAdmin: Yes')).toBeInTheDocument();
    });
  });

  it('skips initialization on login page', async () => {
    (window as any).location.pathname = '/login';
    
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_user', JSON.stringify({
      token: 'test-token',
      user: { id: '1', email: 'test@test.com', role: 'Usuario', name: 'Test' },
      expiresAt: Date.now() + 10000
    }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await waitFor(() => {
      // Should still load the stored data but not redirect
      expect(screen.getByText('User: Test')).toBeInTheDocument();
    });
  });

  it('throws error when useAuth is used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');
    
    consoleError.mockRestore();
  });
});

