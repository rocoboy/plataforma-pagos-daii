import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => jest.fn(),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>
}), { virtual: true });

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, logout: jest.fn() })
}));

import AccessDenied from './AccessDenied';

describe('AccessDenied', () => {
  it('renders access denied message', () => {
    render(<AccessDenied />);
    expect(screen.getByText(/acceso denegado/i)).toBeInTheDocument();
  });
});

