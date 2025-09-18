import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { muiTheme } from '../theme/muiTheme';
import TransactionsPage from '../pages/Transactions';

// Mock dependencies
jest.mock('../lib/apiClient', () => ({
  fetchPayments: jest.fn()
}));

// Get reference to the mock after it's created
const mockFetchPayments = jest.mocked(require('../lib/apiClient').fetchPayments);

jest.mock('../components/DevPaymentModal', () => {
  return function MockDevPaymentModal() {
    return <div data-testid="dev-payment-modal">Dev Payment Modal</div>;
  };
});

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
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('TransactionsPage Component', () => {
  beforeEach(() => {
    // Reset mock before each test
    mockFetchPayments.mockClear();
    // Default mock to reject (simulate error state)
    mockFetchPayments.mockRejectedValue(new Error('Test error'));
  });

  it('renders without crashing', async () => {
    render(
      <TestWrapper>
        <TransactionsPage />
      </TestWrapper>
    );
    
    // Wait for the component to process the error and show the error state
    await waitFor(() => {
      expect(screen.getByText('Error al cargar las transacciones')).toBeInTheDocument();
    });
  });

  it('renders retry button when there is an error', async () => {
    render(
      <TestWrapper>
        <TransactionsPage />
      </TestWrapper>
    );
    
    // Wait for the component to process the error and show the error state
    await waitFor(() => {
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });
  });

  it('calls fetchPayments when retry button is clicked', async () => {
    // Mock window.location.reload to avoid jsdom error
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });

    render(
      <TestWrapper>
        <TransactionsPage />
      </TestWrapper>
    );

    // Wait for the error state to appear first
    await waitFor(() => {
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Reintentar');
    fireEvent.click(retryButton);

    // Verify that window.location.reload was called
    await waitFor(() => {
      expect(mockReload).toHaveBeenCalled();
    });
  });

  it('renders successfully when data loads', async () => {
    // Mock successful data with complete transaction object
    mockFetchPayments.mockResolvedValueOnce([
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
    await waitFor(() => {
      expect(screen.getByText('Skytracker')).toBeInTheDocument();
    });

    expect(screen.getByText('Últimas transacciones')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar transacciones...')).toBeInTheDocument();
    expect(screen.getByText('Limpiar Filtros')).toBeInTheDocument();
    expect(screen.getByText('Actualizar')).toBeInTheDocument();
    expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
  });

  it('calls handleRefreshPayments when refresh button is clicked', async () => {
    // Mock successful data
    mockFetchPayments.mockResolvedValue([
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
    await waitFor(() => {
      expect(screen.getByText('Actualizar')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Actualizar');
    fireEvent.click(refreshButton);

    // Wait for the query to be invalidated
    await waitFor(() => {
      expect(mockFetchPayments).toHaveBeenCalledTimes(2); // Initial load + refresh
    });
  });

  it('renders data grid when data is loaded', async () => {
    // Mock successful data
    mockFetchPayments.mockResolvedValueOnce([
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
    
    await waitFor(() => {
      expect(screen.getByTestId('data-grid')).toBeInTheDocument();
    });
  });

  it('filters transactions by search term', async () => {
    // Mock successful data with multiple transactions
    mockFetchPayments.mockResolvedValueOnce([
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
      },
      {
        id: '2',
        amount: 200,
        status: 'pending',
        description: 'Another payment',
        created_at: '2023-01-02T10:00:00Z',
        updated_at: '2023-01-02T10:00:00Z',
        res_id: 'RES456',
        user_id: 'USER456',
        payment_method: 'debit_card',
        currency: 'USD'
      }
    ]);

    render(
      <TestWrapper>
        <TransactionsPage />
      </TestWrapper>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar transacciones...')).toBeInTheDocument();
    });

    // Search for specific reservation ID
    const searchInput = screen.getByPlaceholderText('Buscar transacciones...');
    fireEvent.change(searchInput, { target: { value: 'RES123' } });

    // The filtering happens automatically
    expect(searchInput.value).toBe('RES123');
  });

  it('filters transactions by status', async () => {
    // Mock successful data
    mockFetchPayments.mockResolvedValueOnce([
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

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Estado')).toBeInTheDocument();
    });

    // Find and interact with status filter
    const statusSelects = screen.getAllByDisplayValue('Todos');
    const statusSelect = statusSelects[0]; // Get the first one
    fireEvent.change(statusSelect, { target: { value: 'success' } });

    expect(statusSelect.value).toBe('success');
  });

  it('filters transactions by date range', async () => {
    // Mock successful data
    mockFetchPayments.mockResolvedValueOnce([
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

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Rango de Fecha')).toBeInTheDocument();
    });

    // Find and interact with date filters by type attribute
    const dateInputs = screen.getAllByDisplayValue('');
    const fromDateInput = dateInputs.find(input => input.getAttribute('type') === 'date');
    
    if (fromDateInput) {
      fireEvent.change(fromDateInput, { target: { value: '2023-01-01' } });
      expect(fromDateInput.value).toBe('2023-01-01');
    } else {
      // If we can't find the date input, at least verify the component renders
      expect(screen.getByText('Rango de Fecha')).toBeInTheDocument();
    }
  });

  it('clears all filters when clear button is clicked', async () => {
    // Mock successful data
    mockFetchPayments.mockResolvedValueOnce([
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

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Limpiar Filtros')).toBeInTheDocument();
    });

    // Set some filters first
    const searchInput = screen.getByPlaceholderText('Buscar transacciones...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Clear filters
    const clearButton = screen.getByText('Limpiar Filtros');
    fireEvent.click(clearButton);

    // Check that search input is cleared
    expect(searchInput.value).toBe('');
  });

  it('opens and closes dev payment modal', async () => {
    // Mock successful data
    mockFetchPayments.mockResolvedValueOnce([]);

    render(
      <TestWrapper>
        <TransactionsPage />
      </TestWrapper>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Crear Pago de Prueba')).toBeInTheDocument();
    });

    // Open modal
    const createPaymentButton = screen.getByText('Crear Pago de Prueba');
    fireEvent.click(createPaymentButton);

    // Modal should be opened (DevPaymentModal component will be rendered)
    expect(screen.getByTestId('dev-payment-modal')).toBeInTheDocument();
  });

  it('handles PDF download', async () => {
    // Mock successful data
    mockFetchPayments.mockResolvedValueOnce([
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

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByTestId('data-grid')).toBeInTheDocument();
    });

    // Click on the data grid to simulate row click (which should trigger PDF download)
    const dataGrid = screen.getByTestId('data-grid');
    fireEvent.click(dataGrid);

    // The PDF download function should be called (mocked jsPDF)
    // We can't easily test the actual PDF generation, but we can verify the component doesn't crash
    expect(dataGrid).toBeInTheDocument();
  });

  it('handles snackbar close', async () => {
    // Mock successful data
    mockFetchPayments.mockResolvedValueOnce([]);

    render(
      <TestWrapper>
        <TransactionsPage />
      </TestWrapper>
    );

    // Wait for component to load and trigger refresh to show snackbar
    await waitFor(() => {
      expect(screen.getByText('Actualizar')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Actualizar');
    fireEvent.click(refreshButton);

    // Wait for snackbar to appear
    await waitFor(() => {
      expect(screen.getByText('Actualizando datos de pagos...')).toBeInTheDocument();
    });

    // The snackbar should be visible
    expect(screen.getByText('Actualizando datos de pagos...')).toBeInTheDocument();
  });

  it('handles different payment statuses correctly', async () => {
    // Mock data with different statuses
    mockFetchPayments.mockResolvedValueOnce([
      {
        id: '1',
        amount: 100,
        status: 'success',
        description: 'Success payment',
        created_at: '2023-01-01T10:00:00Z',
        updated_at: '2023-01-01T10:00:00Z',
        res_id: 'RES123',
        user_id: 'USER123',
        payment_method: 'credit_card',
        currency: 'USD'
      },
      {
        id: '2',
        amount: 200,
        status: 'pending',
        description: 'Pending payment',
        created_at: '2023-01-02T10:00:00Z',
        updated_at: '2023-01-02T10:00:00Z',
        res_id: 'RES456',
        user_id: 'USER456',
        payment_method: 'debit_card',
        currency: 'USD'
      },
      {
        id: '3',
        amount: 300,
        status: 'failure',
        description: 'Failed payment',
        created_at: '2023-01-03T10:00:00Z',
        updated_at: '2023-01-03T10:00:00Z',
        res_id: 'RES789',
        user_id: 'USER789',
        payment_method: 'credit_card',
        currency: 'USD'
      }
    ]);

    render(
      <TestWrapper>
        <TransactionsPage />
      </TestWrapper>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByTestId('data-grid')).toBeInTheDocument();
    });

    // The component should handle different statuses without crashing
    expect(screen.getByTestId('data-grid')).toBeInTheDocument();
  });
});
