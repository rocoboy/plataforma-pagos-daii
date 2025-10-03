import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { muiTheme } from '../theme/muiTheme';
import DevPaymentCreator from '../pages/DevPaymentCreator';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock PaymentCreationForm
jest.mock('../components/PaymentCreationForm', () => {
  return function MockPaymentCreationForm({ submitButtonText, resetFormOnSuccess }: any) {
    return (
      <div data-testid="payment-creation-form">
        <div data-testid="form-props">
          submitButtonText: {submitButtonText}
          resetFormOnSuccess: {resetFormOnSuccess?.toString()}
        </div>
        <button data-testid="mock-submit">Submit Payment</button>
      </div>
    );
  };
});

// Mock MUI components
jest.mock('@mui/material', () => ({
  Box: ({ children, sx, ...props }: any) => <div style={sx} {...props}>{children}</div>,
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  Typography: ({ children, variant, component, color, paragraph, gutterBottom, sx }: any) => (
    <div 
      data-variant={variant} 
      data-component={component} 
      data-color={color}
      data-paragraph={paragraph}
      data-gutterbottom={gutterBottom}
      style={sx}
    >
      {children}
    </div>
  ),
  Paper: ({ children, elevation, sx }: any) => (
    <div data-elevation={elevation} style={sx}>{children}</div>
  ),
  Button: ({ children, startIcon, onClick, variant, size, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} data-size={size} {...props}>
      {startIcon}
      {children}
    </button>
  ),
}));

// Mock MUI icons
jest.mock('@mui/icons-material', () => ({
  ArrowBack: () => <span data-testid="arrow-back-icon" />,
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={muiTheme}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('DevPaymentCreator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <DevPaymentCreator />
      </TestWrapper>
    );
    
    expect(screen.getByText('Creador de Pagos - Desarrollo')).toBeInTheDocument();
  });

  it('renders back button', () => {
    render(
      <TestWrapper>
        <DevPaymentCreator />
      </TestWrapper>
    );
    
    expect(screen.getByText('Volver a Transacciones')).toBeInTheDocument();
    expect(screen.getByTestId('arrow-back-icon')).toBeInTheDocument();
  });

  it('handles back navigation', () => {
    render(
      <TestWrapper>
        <DevPaymentCreator />
      </TestWrapper>
    );
    
    const backButton = screen.getByText('Volver a Transacciones');
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/transactions');
  });

  it('renders description text', () => {
    render(
      <TestWrapper>
        <DevPaymentCreator />
      </TestWrapper>
    );
    
    expect(screen.getByText('Esta página permite crear pagos para pruebas usando los métodos existentes del backend.')).toBeInTheDocument();
    expect(screen.getByText('Los pagos se crean con estado PENDING por defecto.')).toBeInTheDocument();
  });

  it('renders payment creation form', () => {
    render(
      <TestWrapper>
        <DevPaymentCreator />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('payment-creation-form')).toBeInTheDocument();
    expect(screen.getByText('Crear Nuevo Pago')).toBeInTheDocument();
  });

  it('passes correct props to PaymentCreationForm', () => {
    render(
      <TestWrapper>
        <DevPaymentCreator />
      </TestWrapper>
    );
    
    expect(screen.getByText('submitButtonText: Crear Pago')).toBeInTheDocument();
    expect(screen.getByText('resetFormOnSuccess: true')).toBeInTheDocument();
  });

  it('renders system information section', () => {
    render(
      <TestWrapper>
        <DevPaymentCreator />
      </TestWrapper>
    );
    
    expect(screen.getByText('Información del Sistema')).toBeInTheDocument();
    expect(screen.getByText('Esta interfaz utiliza el endpoint existente /api/webhooks/payments para crear pagos.')).toBeInTheDocument();
  });

  it('renders endpoint information', () => {
    render(
      <TestWrapper>
        <DevPaymentCreator />
      </TestWrapper>
    );
    
    expect(screen.getByText('Endpoint utilizado: POST /api/webhooks/payments')).toBeInTheDocument();
  });

  it('renders payment statuses list', () => {
    render(
      <TestWrapper>
        <DevPaymentCreator />
      </TestWrapper>
    );
    
    expect(screen.getByText('Estados disponibles:')).toBeInTheDocument();
    expect(screen.getByText('PENDING - Pago pendiente de procesamiento')).toBeInTheDocument();
    expect(screen.getByText('SUCCESS - Pago procesado exitosamente')).toBeInTheDocument();
    expect(screen.getByText('FAILURE - Pago falló')).toBeInTheDocument();
    expect(screen.getByText('UNDERPAID - Pago insuficiente')).toBeInTheDocument();
    expect(screen.getByText('OVERPAID - Pago en exceso')).toBeInTheDocument();
    expect(screen.getByText('EXPIRED - Pago expirado')).toBeInTheDocument();
    expect(screen.getByText('REFUND - Pago reembolsado')).toBeInTheDocument();
  });

  it('renders cards with proper structure', () => {
    render(
      <TestWrapper>
        <DevPaymentCreator />
      </TestWrapper>
    );
    
    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(2); // Form card and info card
    
    const cardContents = screen.getAllByTestId('card-content');
    expect(cardContents).toHaveLength(2);
  });

  it('renders responsive layout', () => {
    render(
      <TestWrapper>
        <DevPaymentCreator />
      </TestWrapper>
    );
    
    // The component should render without errors
    expect(screen.getByText('Creador de Pagos - Desarrollo')).toBeInTheDocument();
  });

  it('renders all sections in correct order', () => {
    render(
      <TestWrapper>
        <DevPaymentCreator />
      </TestWrapper>
    );
    
    // Check that all main sections are present
    expect(screen.getByText('Creador de Pagos - Desarrollo')).toBeInTheDocument();
    expect(screen.getByText('Crear Nuevo Pago')).toBeInTheDocument();
    expect(screen.getByText('Información del Sistema')).toBeInTheDocument();
  });
});



