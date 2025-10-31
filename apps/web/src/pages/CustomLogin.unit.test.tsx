import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => jest.fn()
}), { virtual: true });

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ login: jest.fn() })
}));

import CustomLoginPage from './CustomLogin';

describe('CustomLoginPage', () => {
  it('renders login form with email and password fields', () => {
    render(<CustomLoginPage />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<CustomLoginPage />);
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });
});

