import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TransactionDetailPage from '../../pages/TransactionDetail';
import { mockTransactionDetails } from '../../data/mockData';

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockUseParams = jest.fn(() => ({ transactionId: 'TXN001' }));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams()
}));

// Mock jsPDF
const mockPDF = {
  setFont: jest.fn(),
  setFontSize: jest.fn(),
  setTextColor: jest.fn(),
  text: jest.fn(),
  setDrawColor: jest.fn(),
  setLineWidth: jest.fn(),
  rect: jest.fn(),
  save: jest.fn()
};

jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockPDF),
}));

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

describe('TransactionDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Loading State', () => {
    it('should show loading spinner while fetching data', () => {
      renderWithProviders(<TransactionDetailPage />);

      expect(screen.getByText('Cargando detalles...')).toBeInTheDocument();
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when transaction not found', async () => {
      // Mock useParams to return non-existent transaction ID
      mockUseParams.mockReturnValue({ transactionId: 'NONEXISTENT' });

      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Error al cargar los detalles')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument();
      });
    });

    it('should navigate back when error occurs', async () => {
      mockUseParams.mockReturnValue({ transactionId: 'NONEXISTENT' });

      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: 'Volver' });
        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith(-1);
      });
    });
  });

  describe('Transaction Display', () => {
    it('should display transaction details when loaded', async () => {
      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        const transaction = mockTransactionDetails['TXN001'];
        expect(screen.getByText(transaction.reservationId)).toBeInTheDocument();
        expect(screen.getByText(transaction.purchaseDate)).toBeInTheDocument();
        expect(screen.getByText(`$${transaction.amount.toFixed(2)}`)).toBeInTheDocument();
        expect(screen.getByText(transaction.paymentMethod)).toBeInTheDocument();
        expect(screen.getByText(transaction.cardNumber)).toBeInTheDocument();
      });
    });

    it('should display flight details', async () => {
      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        const transaction = mockTransactionDetails['TXN001'];
        expect(screen.getByText(transaction.flightNumber)).toBeInTheDocument();
        expect(screen.getByText(transaction.departure)).toBeInTheDocument();
        expect(screen.getByText(transaction.arrival)).toBeInTheDocument();
        expect(screen.getByText(transaction.duration)).toBeInTheDocument();
        expect(screen.getByText(transaction.flightClass)).toBeInTheDocument();
      });
    });

    it('should display page title and navigation', async () => {
      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Historial de Transacciones')).toBeInTheDocument();
        expect(screen.getByText('Detalles de la transacción')).toBeInTheDocument();
        expect(screen.getByText('Detalles Adicionales')).toBeInTheDocument();
      });
    });
  });

  describe('PDF Generation', () => {
    it('should show download button', async () => {
      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /descargar comprobante/i })).toBeInTheDocument();
      });
    });

    it('should show loading state during PDF generation', async () => {
      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        const downloadButton = screen.getByRole('button', { name: /descargar comprobante/i });
        fireEvent.click(downloadButton);

        expect(screen.getByText('Generando PDF...')).toBeInTheDocument();
        expect(screen.getByTestId('pdf-loader')).toBeInTheDocument();
      });
    });

    it('should generate PDF with correct content', async () => {
      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        const downloadButton = screen.getByRole('button', { name: /descargar comprobante/i });
        fireEvent.click(downloadButton);
      });

      await waitFor(() => {
        expect(mockPDF.setFont).toHaveBeenCalledWith('helvetica');
        expect(mockPDF.setFontSize).toHaveBeenCalledWith(20);
        expect(mockPDF.text).toHaveBeenCalledWith('COMPROBANTE DE PAGO', 20, 30);
        expect(mockPDF.save).toHaveBeenCalled();
      });
    });

    it('should handle PDF generation errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      mockPDF.save.mockImplementation(() => {
        throw new Error('PDF generation failed');
      });

      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        const downloadButton = screen.getByRole('button', { name: /descargar comprobante/i });
        fireEvent.click(downloadButton);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error generating PDF:', expect.any(Error));
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back when back button is clicked', async () => {
      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: '' }); // ArrowLeft button
        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith(-1);
      });
    });
  });

  describe('Layout and Styling', () => {
    it('should have proper grid layout', async () => {
      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        const gridContainer = screen.getByText('Detalles de la transacción').closest('.grid');
        expect(gridContainer).toHaveClass('grid-cols-1', 'lg:grid-cols-3');
      });
    });

    it('should have proper card structure', async () => {
      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        const cards = screen.getAllByRole('generic').filter(el => 
          el.classList.contains('card') || el.querySelector('.card')
        );
        expect(cards.length).toBeGreaterThan(0);
      });
    });

    it('should display decorative plane icon', async () => {
      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        expect(screen.getByTestId('plane-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Data Formatting', () => {
    it('should format currency correctly', async () => {
      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        const transaction = mockTransactionDetails['TXN001'];
        const formattedAmount = `$${transaction.amount.toFixed(2)}`;
        expect(screen.getByText(formattedAmount)).toBeInTheDocument();
      });
    });

    it('should display transaction details in proper sections', async () => {
      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        // Check for section headers
        expect(screen.getByText('ID Reserva')).toBeInTheDocument();
        expect(screen.getByText('Fecha')).toBeInTheDocument();
        expect(screen.getByText('Monto')).toBeInTheDocument();
        expect(screen.getByText('Medio de pago')).toBeInTheDocument();
        expect(screen.getByText('Número de vuelo')).toBeInTheDocument();
        expect(screen.getByText('Salida')).toBeInTheDocument();
        expect(screen.getByText('Llegada')).toBeInTheDocument();
        expect(screen.getByText('Duración')).toBeInTheDocument();
        expect(screen.getByText('Clase')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        const mainHeading = screen.getByRole('heading', { level: 1 });
        expect(mainHeading).toHaveTextContent('Historial de Transacciones');

        const subHeadings = screen.getAllByRole('heading', { level: 2 });
        expect(subHeadings).toHaveLength(2);
        expect(subHeadings[0]).toHaveTextContent('Detalles de la transacción');
        expect(subHeadings[1]).toHaveTextContent('Detalles Adicionales');
      });
    });

    it('should have accessible buttons', async () => {
      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: '' });
        const downloadButton = screen.getByRole('button', { name: /descargar comprobante/i });
        
        expect(backButton).toBeInTheDocument();
        expect(downloadButton).toBeInTheDocument();
        expect(downloadButton).not.toHaveAttribute('disabled');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing transaction ID gracefully', async () => {
      mockUseParams.mockReturnValue({ transactionId: undefined });

      renderWithProviders(<TransactionDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Error al cargar los detalles')).toBeInTheDocument();
      });
    });
  });
});
