import React from 'react';
import { render, screen } from '@testing-library/react';
import PaymentCreationForm from './PaymentCreationForm';

// Mock all dependencies
jest.mock('@mui/material', () => ({
  Box: ({ children }: any) => <div>{children}</div>,
  TextField: ({ placeholder, children, ...props }: any) => <input placeholder={placeholder} />,
  Button: ({ children }: any) => <button>{children}</button>,
  Typography: ({ children }: any) => <div>{children}</div>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  InputLabel: ({ children }: any) => <label>{children}</label>,
  Select: ({ children }: any) => <select>{children}</select>,
  MenuItem: ({ children }: any) => <option>{children}</option>,
  Grid: ({ children }: any) => <div>{children}</div>,
  Alert: ({ children }: any) => <div role="alert">{children}</div>,
}));

jest.mock('@mui/icons-material', () => ({
  Save: () => <span data-testid="save-icon" />,
  Cancel: () => <span data-testid="cancel-icon" />,
}));

describe('PaymentCreationForm Component', () => {
  it('renders without crashing', () => {
    render(<PaymentCreationForm />);
    expect(screen.getByText('Complete los datos para crear un nuevo pago de prueba con estado PENDIENTE.')).toBeInTheDocument();
  });

  it('renders form fields', () => {
    render(<PaymentCreationForm />);
    expect(screen.getByPlaceholderText('Ej: 100.50')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: BKG123456')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<PaymentCreationForm />);
    expect(screen.getByText('Crear Pago')).toBeInTheDocument();
  });
});
