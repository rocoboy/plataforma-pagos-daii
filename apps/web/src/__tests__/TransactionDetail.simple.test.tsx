import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
    useParams: () => ({ transactionId: 'TXN123' }),
  };
});

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={muiTheme}>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Import the component after mocks are set up
const TransactionDetailPage = require('../pages/TransactionDetail').default;

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
    
    // Wait for component to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    expect(screen.getByText('Historial de Transacciones')).toBeInTheDocument();
  });

  it('renders back button and download button', async () => {
    render(
      <TestWrapper>
        <TransactionDetailPage />
      </TestWrapper>
    );
    
    // Wait for component to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    expect(screen.getByTestId('arrow-back-icon')).toBeInTheDocument();
    expect(screen.getByText('Descargar Factura')).toBeInTheDocument();
  });
});


