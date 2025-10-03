import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '../theme/muiTheme';

// Mock all dependencies
jest.mock('../lib/apiClient', () => ({
  fetchPayments: jest.fn()
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
    logout: jest.fn()
  })
}));

jest.mock('../components/DevPaymentModal', () => {
  return function MockDevPaymentModal() {
    return <div data-testid="dev-payment-modal">Dev Payment Modal</div>;
  };
});

// Mock MUI DataGrid
jest.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ onRowClick }: any) => (
    <div data-testid="data-grid" onClick={() => onRowClick && onRowClick({ id: '1' })}>
      DataGrid Mock
    </div>
  ),
  GridColDef: {}
}));

// Mock MUI components
jest.mock('@mui/material', () => ({
  Button: ({ children, onClick, startIcon, ...props }: any) => (
    <button onClick={onClick} data-testid={props['data-testid'] || 'button'}>
      {startIcon}
      {children}
    </button>
  ),
  TextField: ({ placeholder, onChange, ...props }: any) => (
    <input placeholder={placeholder} onChange={onChange} {...props} />
  ),
  Select: ({ children, onChange, value, ...props }: any) => (
    <select onChange={onChange} value={value} {...props}>
      {children}
    </select>
  ),
  MenuItem: ({ children, value }: any) => (
    <option value={value}>{children}</option>
  ),
  FormControl: ({ children }: any) => <div>{children}</div>,
  InputLabel: ({ children }: any) => <label>{children}</label>,
  Chip: ({ label }: any) => <span>{label}</span>,
  Box: ({ children }: any) => <div>{children}</div>,
  Container: ({ children }: any) => <div>{children}</div>,
  Typography: ({ children }: any) => <div>{children}</div>,
  CircularProgress: () => <div>Loading...</div>,
  Alert: ({ children }: any) => <div role="alert">{children}</div>,
  Snackbar: ({ children, open }: any) => open ? <div>{children}</div> : null,
}));

// Mock MUI icons
jest.mock('@mui/icons-material', () => ({
  Clear: () => <span data-testid="clear-icon" />,
  Search: () => <span data-testid="search-icon" />,
  Flight: () => <span data-testid="flight-icon" />,
  Download: () => <span data-testid="download-icon" />,
  Check: () => <span data-testid="check-icon" />,
  Close: () => <span data-testid="close-icon" />,
  CurrencyExchange: () => <span data-testid="currency-icon" />,
  Add: () => <span data-testid="add-icon" />,
  SearchOff: () => <span data-testid="search-off-icon" />,
  Receipt: () => <span data-testid="receipt-icon" />,
  Refresh: () => <span data-testid="refresh-icon" />,
  Logout: () => <span data-testid="logout-icon" />,
  Person: () => <span data-testid="person-icon" />,
}));

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    setTextColor: jest.fn(),
    text: jest.fn(),
    save: jest.fn(),
    setDrawColor: jest.fn(),
    setLineWidth: jest.fn(),
    rect: jest.fn(),
  }));
});

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
        <div data-testid="auth-provider">
          {children}
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Import the component after mocks are set up
const TransactionsPage = require('../pages/Transactions').default;

describe('TransactionsPage Component', () => {
  beforeEach(() => {
    // Reset mock before each test
    const { fetchPayments } = require('../lib/apiClient');
    fetchPayments.mockClear();
    // Default mock to reject (simulate error state)
    fetchPayments.mockRejectedValue(new Error('Test error'));
  });

  it('renders without crashing', async () => {
    render(
      <TestWrapper>
        <TransactionsPage />
      </TestWrapper>
    );
    
    // Wait for the component to process the error and show the error state
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(screen.getByText('Error al cargar las transacciones')).toBeInTheDocument();
  });

  it('renders retry button when there is an error', async () => {
    render(
      <TestWrapper>
        <TransactionsPage />
      </TestWrapper>
    );
    
    // Wait for the component to process the error and show the error state
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
  });

  it('renders successfully when data loads', async () => {
    const { fetchPayments } = require('../lib/apiClient');
    // Mock successful data
    fetchPayments.mockResolvedValueOnce([
      {
        id: '1',
        amount: 100,
        status: 'success',
        description: 'Test payment',
        created_at: '2023-01-01T10:00:00Z',
        updated_at: '2023-01-01T10:00:00Z',
        res_id: 'RES123',
        user_id: 'USER123',
        payment_method: 'credit_card',
        currency: 'USD'
      }
    ]);

    render(
      <TestWrapper>
        <TransactionsPage />
      </TestWrapper>
    );

    // Wait for the component to load successfully
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(screen.getByText('Skytracker')).toBeInTheDocument();
  });
});



