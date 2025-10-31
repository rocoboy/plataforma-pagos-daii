import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => jest.fn()
}), { virtual: true });

jest.mock('../components/PaymentCreationForm', () => ({
  __esModule: true,
  default: () => <div data-testid="payment-form">Form</div>
}));

import DevPaymentCreator from './DevPaymentCreator';

describe('DevPaymentCreator', () => {
  it('renders page title', () => {
    render(<DevPaymentCreator />);
    expect(screen.getByText(/creador de pagos/i)).toBeInTheDocument();
  });

  it('renders payment creation form', () => {
    render(<DevPaymentCreator />);
    expect(screen.getByTestId('payment-form')).toBeInTheDocument();
  });
});

