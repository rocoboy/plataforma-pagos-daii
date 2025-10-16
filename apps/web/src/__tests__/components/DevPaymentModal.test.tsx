import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DevPaymentModal from '../../components/DevPaymentModal';

// Mock PaymentCreationForm
jest.mock('../../components/PaymentCreationForm', () => {
  return function MockPaymentCreationForm({ 
    onPaymentCreated, 
    showTitle, 
    submitButtonText, 
    resetFormOnSuccess 
  }: any) {
    return (
      <div data-testid="payment-creation-form">
        <button 
          data-testid="trigger-payment-created"
          onClick={onPaymentCreated}
        >
          Trigger Payment Created
        </button>
        <div data-testid="show-title">{showTitle ? 'true' : 'false'}</div>
        <div data-testid="submit-button-text">{submitButtonText}</div>
        <div data-testid="reset-form">{resetFormOnSuccess ? 'true' : 'false'}</div>
      </div>
    );
  };
});

// Mock UI components
jest.mock('../../components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
}));

jest.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, variant }: any) => (
    <button data-testid="button" data-variant={variant} onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('DevPaymentModal', () => {
  const mockOnClose = jest.fn();
  const mockOnPaymentCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders when open is true', () => {
      render(
        <DevPaymentModal 
          open={true} 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(
        <DevPaymentModal 
          open={false} 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('renders dialog title', () => {
      render(
        <DevPaymentModal 
          open={true} 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.getByText('Crear Pago de Prueba')).toBeInTheDocument();
    });

    it('renders PaymentCreationForm', () => {
      render(
        <DevPaymentModal 
          open={true} 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.getByTestId('payment-creation-form')).toBeInTheDocument();
    });

    it('renders close button', () => {
      render(
        <DevPaymentModal 
          open={true} 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.getByText('Cerrar')).toBeInTheDocument();
    });

    it('renders dialog with proper structure', () => {
      render(
        <DevPaymentModal 
          open={true} 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.getByTestId('dialog-header')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-footer')).toBeInTheDocument();
    });
  });

  describe('Props Passing to PaymentCreationForm', () => {
    it('passes showTitle as true', () => {
      render(
        <DevPaymentModal 
          open={true} 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.getByTestId('show-title')).toHaveTextContent('true');
    });

    it('passes submitButtonText correctly', () => {
      render(
        <DevPaymentModal 
          open={true} 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.getByTestId('submit-button-text')).toHaveTextContent('Crear Pago');
    });

    it('passes resetFormOnSuccess as false', () => {
      render(
        <DevPaymentModal 
          open={true} 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.getByTestId('reset-form')).toHaveTextContent('false');
    });
  });

  describe('Event Handling', () => {
    it('calls onClose when close button is clicked', () => {
      render(
        <DevPaymentModal 
          open={true} 
          onClose={mockOnClose}
        />
      );
      
      const closeButton = screen.getByText('Cerrar');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onPaymentCreated when payment is created', () => {
      render(
        <DevPaymentModal 
          open={true} 
          onClose={mockOnClose}
          onPaymentCreated={mockOnPaymentCreated}
        />
      );
      
      const triggerButton = screen.getByTestId('trigger-payment-created');
      fireEvent.click(triggerButton);
      
      expect(mockOnPaymentCreated).toHaveBeenCalledTimes(1);
    });

    it('does not throw error when onPaymentCreated is not provided', () => {
      render(
        <DevPaymentModal 
          open={true} 
          onClose={mockOnClose}
        />
      );
      
      const triggerButton = screen.getByTestId('trigger-payment-created');
      
      expect(() => fireEvent.click(triggerButton)).not.toThrow();
    });
  });

  describe('Component Props', () => {
    it('accepts all required props', () => {
      const { container } = render(
        <DevPaymentModal 
          open={true} 
          onClose={mockOnClose}
        />
      );
      
      expect(container).toBeTruthy();
    });

    it('accepts optional onPaymentCreated prop', () => {
      const { container } = render(
        <DevPaymentModal 
          open={true} 
          onClose={mockOnClose}
          onPaymentCreated={mockOnPaymentCreated}
        />
      );
      
      expect(container).toBeTruthy();
    });
  });

  describe('Dialog State Management', () => {
    it('shows dialog when open changes to true', () => {
      const { rerender } = render(
        <DevPaymentModal 
          open={false} 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
      
      rerender(
        <DevPaymentModal 
          open={true} 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('hides dialog when open changes to false', () => {
      const { rerender } = render(
        <DevPaymentModal 
          open={true} 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      
      rerender(
        <DevPaymentModal 
          open={false} 
          onClose={mockOnClose}
        />
      );
      
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Button Styling', () => {
    it('renders close button with outline variant', () => {
      render(
        <DevPaymentModal 
          open={true} 
          onClose={mockOnClose}
        />
      );
      
      const button = screen.getByTestId('button');
      expect(button).toHaveAttribute('data-variant', 'outline');
    });
  });
});
