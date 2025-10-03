import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '../theme/muiTheme';
import DevPaymentModal from '../components/DevPaymentModal';

// Mock PaymentCreationForm
jest.mock('../components/PaymentCreationForm', () => {
  return function MockPaymentCreationForm({ onPaymentCreated, showTitle, submitButtonText, resetFormOnSuccess }: any) {
    return (
      <div data-testid="payment-creation-form">
        <div data-testid="form-props">
          showTitle: {showTitle?.toString()}
          submitButtonText: {submitButtonText}
          resetFormOnSuccess: {resetFormOnSuccess?.toString()}
        </div>
        <button 
          data-testid="mock-payment-created"
          onClick={() => onPaymentCreated && onPaymentCreated()}
        >
          Mock Payment Created
        </button>
      </div>
    );
  };
});

// Mock MUI components
jest.mock('@mui/material', () => ({
  Dialog: ({ children, open, onClose, maxWidth, fullWidth, PaperProps }: any) => 
    open ? (
      <div data-testid="dialog" data-maxwidth={maxWidth} data-fullwidth={fullWidth?.toString()}>
        {children}
      </div>
    ) : null,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogActions: ({ children }: any) => <div data-testid="dialog-actions">{children}</div>,
  Button: ({ children, onClick, color }: any) => (
    <button onClick={onClick} data-color={color}>{children}</button>
  ),
  IconButton: ({ children, onClick, size }: any) => (
    <button onClick={onClick} data-size={size}>{children}</button>
  ),
  Box: ({ children }: any) => <div>{children}</div>,
  Typography: ({ children, variant, component }: any) => (
    <div data-variant={variant} data-component={component}>{children}</div>
  ),
  Divider: () => <div data-testid="divider" />,
}));

// Mock MUI icons
jest.mock('@mui/icons-material', () => ({
  Close: () => <span data-testid="close-icon" />,
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

describe('DevPaymentModal Component', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onPaymentCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open is true', () => {
    render(
      <TestWrapper>
        <DevPaymentModal {...defaultProps} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-actions')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <TestWrapper>
        <DevPaymentModal {...defaultProps} open={false} />
      </TestWrapper>
    );
    
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('renders correct title and icon', () => {
    render(
      <TestWrapper>
        <DevPaymentModal {...defaultProps} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('add-icon')).toBeInTheDocument();
    expect(screen.getByText('Crear Pago de Prueba')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(
      <TestWrapper>
        <DevPaymentModal {...defaultProps} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
  });

  it('renders PaymentCreationForm with correct props', () => {
    render(
      <TestWrapper>
        <DevPaymentModal {...defaultProps} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('payment-creation-form')).toBeInTheDocument();
    expect(screen.getByText(/showTitle:\s*true/)).toBeInTheDocument();
    expect(screen.getByText(/submitButtonText:\s*Crear Pago/)).toBeInTheDocument();
    expect(screen.getByText(/resetFormOnSuccess:\s*false/)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <TestWrapper>
        <DevPaymentModal {...defaultProps} />
      </TestWrapper>
    );
    
    const closeButton = screen.getByTestId('close-icon').parentElement;
    fireEvent.click(closeButton!);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button in actions is clicked', () => {
    render(
      <TestWrapper>
        <DevPaymentModal {...defaultProps} />
      </TestWrapper>
    );
    
    const closeButton = screen.getByText('Cerrar');
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('handles payment creation callback', () => {
    render(
      <TestWrapper>
        <DevPaymentModal {...defaultProps} />
      </TestWrapper>
    );
    
    const mockPaymentCreatedButton = screen.getByTestId('mock-payment-created');
    fireEvent.click(mockPaymentCreatedButton);
    
    expect(defaultProps.onPaymentCreated).toHaveBeenCalledTimes(1);
  });

  it('works without onPaymentCreated callback', () => {
    const propsWithoutCallback = {
      open: true,
      onClose: jest.fn(),
    };
    
    render(
      <TestWrapper>
        <DevPaymentModal {...propsWithoutCallback} />
      </TestWrapper>
    );
    
    const mockPaymentCreatedButton = screen.getByTestId('mock-payment-created');
    fireEvent.click(mockPaymentCreatedButton);
    
    // Should not throw error
    expect(screen.getByTestId('payment-creation-form')).toBeInTheDocument();
  });

  it('renders divider between title and content', () => {
    render(
      <TestWrapper>
        <DevPaymentModal {...defaultProps} />
      </TestWrapper>
    );
    
    expect(screen.getByTestId('divider')).toBeInTheDocument();
  });

  it('has correct dialog properties', () => {
    render(
      <TestWrapper>
        <DevPaymentModal {...defaultProps} />
      </TestWrapper>
    );
    
    const dialog = screen.getByTestId('dialog');
    expect(dialog).toHaveAttribute('data-maxwidth', 'sm');
    expect(dialog).toHaveAttribute('data-fullwidth', 'true');
  });
});
