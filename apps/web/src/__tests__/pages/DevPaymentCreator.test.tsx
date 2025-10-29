import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DevPaymentCreator from '../../pages/DevPaymentCreator';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock PaymentCreationForm component
jest.mock('../../components/PaymentCreationForm', () => {
  return function MockPaymentCreationForm({ submitButtonText, resetFormOnSuccess }: any) {
    return (
      <div data-testid="payment-creation-form">
        <div>Submit Button Text: {submitButtonText}</div>
        <div>Reset Form On Success: {resetFormOnSuccess ? 'true' : 'false'}</div>
      </div>
    );
  };
});

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('DevPaymentCreator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all main sections', () => {
      renderWithProviders(<DevPaymentCreator />);

      expect(screen.getByText('Creador de Pagos')).toBeInTheDocument();
      expect(screen.getByText('Crear Nuevo Pago')).toBeInTheDocument();
      expect(screen.getByText('Información del Sistema')).toBeInTheDocument();
    });

    it('should render back button with correct text', () => {
      renderWithProviders(<DevPaymentCreator />);

      const backButton = screen.getByRole('button', { name: /volver a transacciones/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should render payment creation form with correct props', () => {
      renderWithProviders(<DevPaymentCreator />);

      const form = screen.getByTestId('payment-creation-form');
      expect(form).toBeInTheDocument();
      expect(screen.getByText('Submit Button Text: Crear Pago')).toBeInTheDocument();
      expect(screen.getByText('Reset Form On Success: true')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to payments when back button is clicked', () => {
      renderWithProviders(<DevPaymentCreator />);

      const backButton = screen.getByRole('button', { name: /volver a transacciones/i });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/payments');
    });
  });

  describe('Information Section', () => {
    it('should display correct endpoint information', () => {
      renderWithProviders(<DevPaymentCreator />);

      expect(screen.getByText(/endpoint existente/)).toBeInTheDocument();
      expect(screen.getByText('/api/webhooks/payments')).toBeInTheDocument();
    });

    it('should display payment status information', () => {
      renderWithProviders(<DevPaymentCreator />);

      expect(screen.getByText('Estados disponibles:')).toBeInTheDocument();
      expect(screen.getByText('PENDING - Pago pendiente de procesamiento')).toBeInTheDocument();
      expect(screen.getByText('SUCCESS - Pago procesado exitosamente')).toBeInTheDocument();
      expect(screen.getByText('FAILURE - Pago falló')).toBeInTheDocument();
      expect(screen.getByText('UNDERPAID - Pago insuficiente')).toBeInTheDocument();
      expect(screen.getByText('OVERPAID - Pago en exceso')).toBeInTheDocument();
      expect(screen.getByText('EXPIRED - Pago expirado')).toBeInTheDocument();
      expect(screen.getByText('REFUND - Pago reembolsado')).toBeInTheDocument();
    });

    it('should display endpoint information', () => {
      renderWithProviders(<DevPaymentCreator />);

      expect(screen.getByText('Endpoint utilizado:')).toBeInTheDocument();
      expect(screen.getByText('POST /api/webhooks/payments')).toBeInTheDocument();
    });

    it('should display system description', () => {
      renderWithProviders(<DevPaymentCreator />);

      expect(screen.getByText(/Esta interfaz utiliza el endpoint existente/)).toBeInTheDocument();
      expect(screen.getByText(/Los pagos se crean con estado PENDING por defecto/)).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should have correct grid layout', () => {
      renderWithProviders(<DevPaymentCreator />);

      const container = screen.getByText('Creador de Pagos').closest('.container');
      expect(container).toHaveClass('mx-auto', 'py-6', 'space-y-6');
    });

    it('should have form and information cards in grid', () => {
      renderWithProviders(<DevPaymentCreator />);

      const gridContainer = screen.getByText('Crear Nuevo Pago').closest('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'gap-6');
    });

    it('should have proper card structure', () => {
      renderWithProviders(<DevPaymentCreator />);

      const cards = screen.getAllByRole('generic').filter(el => 
        el.classList.contains('card') || el.querySelector('.card')
      );
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(<DevPaymentCreator />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Creador de Pagos');

      const subHeadings = screen.getAllByRole('heading', { level: 2 });
      expect(subHeadings).toHaveLength(2);
      expect(subHeadings[0]).toHaveTextContent('Crear Nuevo Pago');
      expect(subHeadings[1]).toHaveTextContent('Información del Sistema');
    });

    it('should have accessible button', () => {
      renderWithProviders(<DevPaymentCreator />);

      const backButton = screen.getByRole('button', { name: /volver a transacciones/i });
      expect(backButton).toBeInTheDocument();
      expect(backButton).not.toHaveAttribute('disabled');
    });
  });

  describe('Component Integration', () => {
    it('should pass correct props to PaymentCreationForm', () => {
      renderWithProviders(<DevPaymentCreator />);

      const form = screen.getByTestId('payment-creation-form');
      expect(form).toBeInTheDocument();

      // Verify the props are passed correctly
      expect(screen.getByText('Submit Button Text: Crear Pago')).toBeInTheDocument();
      expect(screen.getByText('Reset Form On Success: true')).toBeInTheDocument();
    });

    it('should render all required UI components', () => {
      renderWithProviders(<DevPaymentCreator />);

      // Check for icons
      expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
      
      // Check for cards
      expect(screen.getByText('Crear Nuevo Pago')).toBeInTheDocument();
      expect(screen.getByText('Información del Sistema')).toBeInTheDocument();
    });
  });

  describe('Content Validation', () => {
    it('should have all required status descriptions', () => {
      renderWithProviders(<DevPaymentCreator />);

      const statusItems = [
        'PENDING - Pago pendiente de procesamiento',
        'SUCCESS - Pago procesado exitosamente',
        'FAILURE - Pago falló',
        'UNDERPAID - Pago insuficiente',
        'OVERPAID - Pago en exceso',
        'EXPIRED - Pago expirado',
        'REFUND - Pago reembolsado'
      ];

      statusItems.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it('should display correct technical information', () => {
      renderWithProviders(<DevPaymentCreator />);

      expect(screen.getByText(/Los pagos se crean con estado PENDING por defecto/)).toBeInTheDocument();
      expect(screen.getByText(/pueden ser actualizados posteriormente/)).toBeInTheDocument();
    });
  });
});
