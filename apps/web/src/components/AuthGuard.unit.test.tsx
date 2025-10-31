import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  __esModule: true,
  Navigate: ({ to }: any) => <div data-testid="navigate">{to}</div>
}), { virtual: true });

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'Usuario' }, isAuthenticated: true })
}));

import AuthGuard from './AuthGuard';

describe('AuthGuard', () => {
  it('renders children when authenticated', () => {
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

