import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { muiTheme } from '../theme/muiTheme';
import TransactionDetailPage from '../pages/TransactionDetail';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ transactionId: 'TXN123' }),
}));

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFont: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    text: jest.fn(),
    setDrawColor: jest.fn(),
    setLineWidth: jest.fn(),
    rect: jest.fn(),
    save: jest.fn(),
  }));
});

// Mock data
jest.mock('../data/mockData', () => ({
  mockTransactionDetails: {
    TXN123: {
      reservationId: '#RES123',
      purchaseDate: '2023-12-01',
      amount: 150.75,
      paymentMethod: 'Tarjeta de Crédito',
      cardNumber: '**** 1234',
      flightNumber: 'AA123',
      departure: 'Buenos Aires (EZE)',
      arrival: 'Madrid (MAD)',
      duration: '12h 30m',
      flightClass: 'Economy'
    }
  }
}));

// Mock MUI components
jest.mock('@mui/material', () => ({
  Box: ({ children, sx, ...props }: any) => <div style={sx} {...props}>{children}</div>,
  Container: ({ children, maxWidth, sx }: any) => <div data-maxwidth={maxWidth} style={sx}>{children}</div>,
  Typography: ({ children, variant, component, color, sx }: any) => (
    <div data-variant={variant} data-component={component} data-color={color} style={sx}>{children}</div>
  ),
  Button: ({ children, variant, startIcon, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} {...props}>
      {startIcon}
      {children}
    </button>
  ),
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  Grid: ({ children, container, size }: any) => (
    <div data-container={container} data-size={JSON.stringify(size)}>{children}</div>
  ),
  IconButton: ({ children, onClick, sx, 'aria-label': ariaLabel }: any) => (
    <button onClick={onClick} aria-label={ariaLabel} style={sx}>{children}</button>
  ),
  CircularProgress: ({ size, color, sx }: any) => (
    <div data-size={size} data-color={color} style={sx} data-testid="circular-progress">Loading...</div>
  ),
  Divider: () => <div data-testid="divider" />,
}));

// Mock MUI icons
jest.mock('@mui/icons-material', () => ({
  ArrowBack: () => <span data-testid="arrow-back-icon" />,
  Download: () => <span data-testid="download-icon" />,
  Flight: () => <span data-testid="flight-icon" />,
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={muiTheme}>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('TransactionDetailPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <TestWrapper>
        <TransactionDetailPage />
      </TestWrapper>
    );
    
    expect(screen.getByText('Cargando detalles...')).toBeInTheDocument();
    expect(screen.getByTestId('circular-progress')).toBeInTheDocument();
  });

  it('renders transaction details after loading', async () => {
    render(
      <TestWrapper>
        <TransactionDetailPage />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Historial de Transacciones')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Detalles de la transacción')).toBeInTheDocument();
    expect(screen.getByText('#RES123')).toBeInTheDocument();
    expect(screen.getByText('2023-12-01')).toBeInTheDocument();
    expect(screen.getByText('$150.75')).toBeInTheDocument();
    expect(screen.getByText('Tarjeta de Crédito')).toBeInTheDocument();
    expect(screen.getByText('**** 1234')).toBeInTheDocument();
  });

  it('renders flight details', async () => {
    render(
      <TestWrapper>
        <TransactionDetailPage />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Detalles del Vuelo')).toBeInTheDocument();
    });
    
    expect(screen.getByText('AA123')).toBeInTheDocument();
    expect(screen.getByText('Buenos Aires (EZE)')).toBeInTheDocument();
    expect(screen.getByText('Madrid (MAD)')).toBeInTheDocument();
    expect(screen.getByText('12h 30m')).toBeInTheDocument();
    expect(screen.getByText('Economy')).toBeInTheDocument();
  });

  it('renders back button and download button', async () => {
    render(
      <TestWrapper>
        <TransactionDetailPage />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('arrow-back-icon')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Descargar Factura')).toBeInTheDocument();
    expect(screen.getByTestId('download-icon')).toBeInTheDocument();
  });

  it('handles back navigation', async () => {
    render(
      <TestWrapper>
        <TransactionDetailPage />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('arrow-back-icon')).toBeInTheDocument();
    });
    
    const backButton = screen.getByTestId('arrow-back-icon').parentElement;
    fireEvent.click(backButton!);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('handles PDF download', async () => {
    render(
      <TestWrapper>
        <TransactionDetailPage />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Descargar Factura')).toBeInTheDocument();
    });
    
    const downloadButton = screen.getByText('Descargar Factura');
    fireEvent.click(downloadButton);
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Generando PDF...')).toBeInTheDocument();
    });
    
    // Should eventually complete
    await waitFor(() => {
      expect(screen.getByText('Descargar Factura')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('renders error state when transaction not found', async () => {
    // Mock useParams to return non-existent transaction
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
      useParams: () => ({ transactionId: 'NONEXISTENT' }),
    }));

    render(
      <TestWrapper>
        <TransactionDetailPage />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Error al cargar los detalles')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Volver')).toBeInTheDocument();
  });

  it('handles error state back navigation', async () => {
    // Mock useParams to return non-existent transaction
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
      useParams: () => ({ transactionId: 'NONEXISTENT' }),
    }));

    render(
      <TestWrapper>
        <TransactionDetailPage />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Volver')).toBeInTheDocument();
    });
    
    const backButton = screen.getByText('Volver');
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('renders decorative flight icon', async () => {
    render(
      <TestWrapper>
        <TransactionDetailPage />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('flight-icon')).toBeInTheDocument();
    });
  });

  it('disables download button during PDF generation', async () => {
    render(
      <TestWrapper>
        <TransactionDetailPage />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Descargar Factura')).toBeInTheDocument();
    });
    
    const downloadButton = screen.getByText('Descargar Factura');
    fireEvent.click(downloadButton);
    
    // Button should be disabled during generation
    await waitFor(() => {
      expect(downloadButton).toBeDisabled();
    });
  });

  it('renders all transaction information sections', async () => {
    render(
      <TestWrapper>
        <TransactionDetailPage />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('ID Reserva')).toBeInTheDocument();
      expect(screen.getByText('Fecha')).toBeInTheDocument();
      expect(screen.getByText('Monto')).toBeInTheDocument();
      expect(screen.getByText('Medio de pago')).toBeInTheDocument();
    });
  });

  it('renders all flight information sections', async () => {
    render(
      <TestWrapper>
        <TransactionDetailPage />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Número de vuelo')).toBeInTheDocument();
      expect(screen.getByText('Salida')).toBeInTheDocument();
      expect(screen.getByText('Llegada')).toBeInTheDocument();
      expect(screen.getByText('Duración')).toBeInTheDocument();
      expect(screen.getByText('Clase')).toBeInTheDocument();
    });
  });
});



