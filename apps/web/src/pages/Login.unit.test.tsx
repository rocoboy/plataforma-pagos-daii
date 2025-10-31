import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => jest.fn()
}), { virtual: true });

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ login: jest.fn() })
}));

import LoginPage from './Login';

describe('LoginPage', () => {
  it('renders login button', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});

