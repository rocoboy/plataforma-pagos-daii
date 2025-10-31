import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@tanstack/react-query', () => ({
  useMutation: () => ({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    isSuccess: false
  })
}));

import PaymentCreationForm from './PaymentCreationForm';

describe('PaymentCreationForm', () => {
  it('renders form fields', () => {
    render(<PaymentCreationForm />);
    expect(screen.getByLabelText(/id de reserva/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/id de usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/monto/i)).toBeInTheDocument();
  });
});

