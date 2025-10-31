import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => jest.fn(),
}), { virtual: true });

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ login: jest.fn() })
}));

import CustomLoginPage from './CustomLogin';

describe('CustomLoginPage (simple)', () => {
  it('renders basic login UI and toggles password', () => {
    render(<CustomLoginPage />);

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tus credenciales')).toBeInTheDocument();

    const passwordInput = screen.getByLabelText('Contraseña');
    const toggle = passwordInput.parentElement?.querySelector('button') as HTMLButtonElement;

    expect(passwordInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggle);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
