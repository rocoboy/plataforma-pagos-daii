import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '../theme/muiTheme';
import PaymentCreationForm from '../components/PaymentCreationForm';

// Mock fetch globally
global.fetch = jest.fn();

// Mock MUI components
jest.mock('@mui/material', () => ({
  Box: ({ children, component, onSubmit, sx }: any) => (
    <form onSubmit={onSubmit} data-testid="form" style={sx}>
      {children}
    </form>
  ),
  Typography: ({ children, variant, sx }: any) => (
    <div data-variant={variant} style={sx}>{children}</div>
  ),
  TextField: ({ label, value, onChange, required, fullWidth, placeholder, helperText, type, inputProps, select, multiline, rows, children }: any) => (
    <div>
      <label>{label}</label>
      {select ? (
        <select value={value} onChange={onChange} data-testid={`select-${label.toLowerCase().replace(/\s+/g, '-')}`}>
          {children}
        </select>
      ) : (
        <input
          type={type || 'text'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          data-testid={`input-${label.toLowerCase().replace(/\s+/g, '-')}`}
          {...inputProps}
        />
      )}
      {helperText && <div data-testid="helper-text">{helperText}</div>}
    </div>
  ),
  Button: ({ children, type, variant, disabled, startIcon, sx, onClick }: any) => (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      data-variant={variant}
      data-testid="submit-button"
      style={sx}
    >
      {startIcon}
      {children}
    </button>
  ),
  MenuItem: ({ children, value }: any) => (
    <option value={value}>{children}</option>
  ),
  Alert: ({ children, severity, sx }: any) => (
    <div data-severity={severity} style={sx} data-testid="alert">
      {children}
    </div>
  ),
}));

// Mock MUI icons
jest.mock('@mui/icons-material', () => ({
  Add: () => <span data-testid="add-icon" />,
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider theme={muiTheme}>
      {children}
    </ThemeProvider>
  );
};

describe('PaymentCreationForm Component', () => {
  const defaultProps = {
    onPaymentCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders form fields correctly', () => {
    render(
      <TestWrapper>
        <PaymentCreationForm {...defaultProps} />
      </TestWrapper>
    );
    
    expect(screen.getByLabelText('ID de Reserva')).toBeInTheDocument();
    expect(screen.getByLabelText('ID de Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Monto')).toBeInTheDocument();
    expect(screen.getByLabelText('Moneda')).toBeInTheDocument();
    expect(screen.getByLabelText('Metadatos (Opcional)')).toBeInTheDocument();
  });

  it('renders with default props', () => {
    render(
      <TestWrapper>
        <PaymentCreationForm />
      </TestWrapper>
    );
    
    expect(screen.getByText('Complete los datos para crear un nuevo pago de prueba con estado PENDIENTE.')).toBeInTheDocument();
    expect(screen.getByText('Crear Pago')).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    render(
      <TestWrapper>
        <PaymentCreationForm 
          showTitle={false}
          submitButtonText="Custom Submit"
          resetFormOnSuccess={false}
        />
      </TestWrapper>
    );
    
    expect(screen.queryByText('Complete los datos para crear un nuevo pago de prueba con estado PENDIENTE.')).not.toBeInTheDocument();
    expect(screen.getByText('Custom Submit')).toBeInTheDocument();
  });

  it('handles input changes correctly', () => {
    render(
      <TestWrapper>
        <PaymentCreationForm {...defaultProps} />
      </TestWrapper>
    );
    
    const resIdInput = screen.getByTestId('input-id-de-reserva');
    const userIdInput = screen.getByTestId('input-id-de-usuario');
    const amountInput = screen.getByTestId('input-monto');
    
    fireEvent.change(resIdInput, { target: { value: 'RES123' } });
    fireEvent.change(userIdInput, { target: { value: 'USER456' } });
    fireEvent.change(amountInput, { target: { value: '100.50' } });
    
    expect(resIdInput).toHaveValue('RES123');
    expect(userIdInput).toHaveValue('USER456');
    expect(amountInput).toHaveValue('100.50');
  });

  it('validates required fields on submit', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, payment: { id: 'PAY123' } })
    });

    render(
      <TestWrapper>
        <PaymentCreationForm {...defaultProps} />
      </TestWrapper>
    );
    
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Por favor complete todos los campos requeridos')).toBeInTheDocument();
    });
    
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('validates amount is positive number', async () => {
    render(
      <TestWrapper>
        <PaymentCreationForm {...defaultProps} />
      </TestWrapper>
    );
    
    // Fill required fields
    fireEvent.change(screen.getByTestId('input-id-de-reserva'), { target: { value: 'RES123' } });
    fireEvent.change(screen.getByTestId('input-id-de-usuario'), { target: { value: 'USER456' } });
    fireEvent.change(screen.getByTestId('input-monto'), { target: { value: '-10' } });
    
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('El monto debe ser un número positivo')).toBeInTheDocument();
    });
  });

  it('submits form successfully', async () => {
    const mockResponse = {
      success: true,
      payment: { id: 'PAY123' }
    };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <TestWrapper>
        <PaymentCreationForm {...defaultProps} />
      </TestWrapper>
    );
    
    // Fill form
    fireEvent.change(screen.getByTestId('input-id-de-reserva'), { target: { value: 'RES123' } });
    fireEvent.change(screen.getByTestId('input-id-de-usuario'), { target: { value: 'USER456' } });
    fireEvent.change(screen.getByTestId('input-monto'), { target: { value: '100.50' } });
    
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/webhooks/payments'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('RES123')
        })
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText('¡Pago creado exitosamente!')).toBeInTheDocument();
    });
    
    expect(defaultProps.onPaymentCreated).toHaveBeenCalled();
  });

  it('handles API error response', async () => {
    const mockResponse = {
      success: false,
      error: 'API Error'
    };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <TestWrapper>
        <PaymentCreationForm {...defaultProps} />
      </TestWrapper>
    );
    
    // Fill form
    fireEvent.change(screen.getByTestId('input-id-de-reserva'), { target: { value: 'RES123' } });
    fireEvent.change(screen.getByTestId('input-id-de-usuario'), { target: { value: 'USER456' } });
    fireEvent.change(screen.getByTestId('input-monto'), { target: { value: '100.50' } });
    
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Error al crear el pago')).toBeInTheDocument();
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('handles network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <TestWrapper>
        <PaymentCreationForm {...defaultProps} />
      </TestWrapper>
    );
    
    // Fill form
    fireEvent.change(screen.getByTestId('input-id-de-reserva'), { target: { value: 'RES123' } });
    fireEvent.change(screen.getByTestId('input-id-de-usuario'), { target: { value: 'USER456' } });
    fireEvent.change(screen.getByTestId('input-monto'), { target: { value: '100.50' } });
    
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Error al crear el pago')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, payment: { id: 'PAY123' } })
      }), 100))
    );

    render(
      <TestWrapper>
        <PaymentCreationForm {...defaultProps} />
      </TestWrapper>
    );
    
    // Fill form
    fireEvent.change(screen.getByTestId('input-id-de-reserva'), { target: { value: 'RES123' } });
    fireEvent.change(screen.getByTestId('input-id-de-usuario'), { target: { value: 'USER456' } });
    fireEvent.change(screen.getByTestId('input-monto'), { target: { value: '100.50' } });
    
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Creando...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('resets form on success when resetFormOnSuccess is true', async () => {
    const mockResponse = {
      success: true,
      payment: { id: 'PAY123' }
    };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <TestWrapper>
        <PaymentCreationForm {...defaultProps} resetFormOnSuccess={true} />
      </TestWrapper>
    );
    
    // Fill form
    fireEvent.change(screen.getByTestId('input-id-de-reserva'), { target: { value: 'RES123' } });
    fireEvent.change(screen.getByTestId('input-id-de-usuario'), { target: { value: 'USER456' } });
    fireEvent.change(screen.getByTestId('input-monto'), { target: { value: '100.50' } });
    
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('¡Pago creado exitosamente!')).toBeInTheDocument();
    });
    
    // Form should be reset
    expect(screen.getByTestId('input-id-de-reserva')).toHaveValue('');
    expect(screen.getByTestId('input-id-de-usuario')).toHaveValue('');
    expect(screen.getByTestId('input-monto')).toHaveValue('');
  });

  it('does not reset form on success when resetFormOnSuccess is false', async () => {
    const mockResponse = {
      success: true,
      payment: { id: 'PAY123' }
    };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <TestWrapper>
        <PaymentCreationForm {...defaultProps} resetFormOnSuccess={false} />
      </TestWrapper>
    );
    
    // Fill form
    fireEvent.change(screen.getByTestId('input-id-de-reserva'), { target: { value: 'RES123' } });
    fireEvent.change(screen.getByTestId('input-id-de-usuario'), { target: { value: 'USER456' } });
    fireEvent.change(screen.getByTestId('input-monto'), { target: { value: '100.50' } });
    
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('¡Pago creado exitosamente!')).toBeInTheDocument();
    });
    
    // Form should not be reset
    expect(screen.getByTestId('input-id-de-reserva')).toHaveValue('RES123');
    expect(screen.getByTestId('input-id-de-usuario')).toHaveValue('USER456');
    expect(screen.getByTestId('input-monto')).toHaveValue('100.50');
  });

  it('clears result when user starts typing', async () => {
    const mockResponse = {
      success: false,
      error: 'Some error'
    };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(
      <TestWrapper>
        <PaymentCreationForm {...defaultProps} />
      </TestWrapper>
    );
    
    // Fill form and submit to get error
    fireEvent.change(screen.getByTestId('input-id-de-reserva'), { target: { value: 'RES123' } });
    fireEvent.change(screen.getByTestId('input-id-de-usuario'), { target: { value: 'USER456' } });
    fireEvent.change(screen.getByTestId('input-monto'), { target: { value: '100.50' } });
    
    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Error al crear el pago')).toBeInTheDocument();
    });
    
    // Start typing to clear result
    fireEvent.change(screen.getByTestId('input-id-de-reserva'), { target: { value: 'RES456' } });
    
    // Error message should be cleared
    expect(screen.queryByText('Error al crear el pago')).not.toBeInTheDocument();
  });
});



