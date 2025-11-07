import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentCreationForm from '../../components/PaymentCreationForm';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('PaymentCreationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with all required fields', () => {
    render(<PaymentCreationForm />);
    
    expect(screen.getByLabelText(/id de reserva/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/id de usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/monto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/moneda/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear pago/i })).toBeInTheDocument();
  });

  it('enables submit button even when required fields are empty', () => {
    render(<PaymentCreationForm />);
    
    const submitButton = screen.getByRole('button', { name: /crear pago/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('enables submit button when all fields are filled', () => {
    render(<PaymentCreationForm />);
    
    const reservationInput = screen.getByLabelText(/id de reserva/i);
    const userIdInput = screen.getByLabelText(/id de usuario/i);
    const amountInput = screen.getByLabelText(/monto/i);
    
    fireEvent.change(reservationInput, { target: { value: 'RES123' } });
    fireEvent.change(userIdInput, { target: { value: 'USER123' } });
    fireEvent.change(amountInput, { target: { value: '100' } });
    
    const submitButton = screen.getByRole('button', { name: /crear pago/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows validation error when submitting empty form', async () => {
    render(<PaymentCreationForm />);
    
    const submitButton = screen.getByRole('button', { name: /crear pago/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/por favor complete todos los campos requeridos/i)).toBeInTheDocument();
    });
  });

  it('handles successful payment creation', async () => {
    const mockResponse = {
      success: true,
      payment: {
        id: '1',
        res_id: 'RES123',
        user_id: 'USER123',
        amount: 100,
        currency: 'ARS',
        status: 'pending',
        created_at: '2025-01-15T10:30:00Z',
        meta: null,
        modified_at: null,
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const onPaymentCreated = jest.fn();
    render(<PaymentCreationForm onPaymentCreated={onPaymentCreated} />);
    
    const reservationInput = screen.getByLabelText(/id de reserva/i);
    const userIdInput = screen.getByLabelText(/id de usuario/i);
    const amountInput = screen.getByLabelText(/monto/i);
    const submitButton = screen.getByRole('button', { name: /crear pago/i });
    
    fireEvent.change(reservationInput, { target: { value: 'RES123' } });
    fireEvent.change(userIdInput, { target: { value: 'USER123' } });
    fireEvent.change(amountInput, { target: { value: '100' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(onPaymentCreated).toHaveBeenCalled();
    });
  });

  it('handles payment creation error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<PaymentCreationForm />);
    
    const reservationInput = screen.getByLabelText(/id de reserva/i);
    const userIdInput = screen.getByLabelText(/id de usuario/i);
    const amountInput = screen.getByLabelText(/monto/i);
    const submitButton = screen.getByRole('button', { name: /crear pago/i });
    
    fireEvent.change(reservationInput, { target: { value: 'RES123' } });
    fireEvent.change(userIdInput, { target: { value: 'USER123' } });
    fireEvent.change(amountInput, { target: { value: '100' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/error al crear el pago/i)).toBeInTheDocument();
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<PaymentCreationForm />);
    
    const reservationInput = screen.getByLabelText(/id de reserva/i);
    const userIdInput = screen.getByLabelText(/id de usuario/i);
    const amountInput = screen.getByLabelText(/monto/i);
    const submitButton = screen.getByRole('button', { name: /crear pago/i });
    
    fireEvent.change(reservationInput, { target: { value: 'RES123' } });
    fireEvent.change(userIdInput, { target: { value: 'USER123' } });
    fireEvent.change(amountInput, { target: { value: '100' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/creando.../i)).toBeInTheDocument();
  });
});
