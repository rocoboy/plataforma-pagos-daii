import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '../theme/muiTheme';
import { MemoryRouter } from 'react-router-dom';

// Lightweight stubs for hooks only
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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
    <ThemeProvider theme={muiTheme}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </ThemeProvider>
  );
};

// Import the component after mocks are set up
const DevPaymentCreator = require('../pages/DevPaymentCreator').default;

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

  it('renders system information section', () => {
    render(
      <TestWrapper>
        <DevPaymentCreator />
      </TestWrapper>
    );
    
    expect(screen.getByText('Información del Sistema')).toBeInTheDocument();
    expect(screen.getByText('Esta interfaz utiliza el endpoint existente /api/webhooks/payments para crear pagos.')).toBeInTheDocument();
  });
});


