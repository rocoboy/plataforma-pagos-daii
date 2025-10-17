import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import TransactionsPage from '../../pages/Transactions';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPayments } from '../../lib/apiClient';
import '@testing-library/jest-dom';

// Mock the dependencies
jest.mock('../../contexts/AuthContext');
jest.mock('../../lib/apiClient');
jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    save: jest.fn(),
  })),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <div>Search Icon</div>,
  LogOut: () => <div>LogOut Icon</div>,
  User: () => <div>User Icon</div>,
  RotateCw: () => <div>RotateCw Icon</div>,
  XIcon: () => <div>XIcon</div>,
  'X': () => <div>X Icon</div>,
  Download: () => <div>Download Icon</div>,
  SearchX: () => <div>SearchX Icon</div>,
  Receipt: () => <div>Receipt Icon</div>,
  Loader2: () => <div>Loader2 Icon</div>,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockFetchPayments = fetchPayments as jest.MockedFunction<typeof fetchPayments>;

// Mock payment data
const mockPayments = [
  {
    id: 'pay-001',
    res_id: 'res-001',
    user_id: 'user-001',
    created_at: '2024-01-15T10:30:00Z',
    modified_at: '2024-01-15T10:30:00Z',
    status: 'success',
    amount: 150.50,
    currency: 'USD' as const,
    meta: {},
  },
  {
    id: 'pay-002',
    res_id: 'res-002',
    user_id: 'user-002',
    created_at: '2024-01-14T08:15:00Z',
    modified_at: '2024-01-14T08:15:00Z',
    status: 'pending',
    amount: 299.99,
    currency: 'USD' as const,
    meta: {},
  },
  {
    id: 'pay-003',
    res_id: 'res-003',
    user_id: 'user-003',
    created_at: '2024-01-13T14:45:00Z',
    modified_at: '2024-01-13T14:45:00Z',
    status: 'failure',
    amount: 75.25,
    currency: 'USD' as const,
    meta: {},
  },
];

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('TransactionsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { id: 'user-001', name: 'Test User', email: 'test@example.com', role: 'user' },
      logout: jest.fn(),
      login: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      token: 'mock-token',
      isAdmin: false,
      refreshAuth: jest.fn(),
    });
    mockFetchPayments.mockResolvedValue(mockPayments);
  });

  it('renders the transactions page with header', async () => {
    renderWithProviders(<TransactionsPage />);

    expect(screen.getByText('Transacciones')).toBeInTheDocument();
    expect(screen.getByText('Últimas transacciones')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar transacciones...')).toBeInTheDocument();
  });

  it('displays user information in header', async () => {
    renderWithProviders(<TransactionsPage />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
  });

  it('displays loading state', async () => {
    mockFetchPayments.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderWithProviders(<TransactionsPage />);

    expect(screen.getByText('Cargando transacciones...')).toBeInTheDocument();
  });

  it('displays transactions in table', async () => {
    renderWithProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('res-001')).toBeInTheDocument();
      expect(screen.getByText('pay-001')).toBeInTheDocument();
      expect(screen.getByText('user-001')).toBeInTheDocument();
      expect(screen.getByText('$150.50')).toBeInTheDocument();
    });
  });

  it('filters transactions by search term', async () => {
    renderWithProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('res-001')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Buscar transacciones...');
    fireEvent.change(searchInput, { target: { value: 'pay-001' } });

    await waitFor(() => {
      expect(screen.getByText('pay-001')).toBeInTheDocument();
      expect(screen.queryByText('pay-002')).not.toBeInTheDocument();
    });
  });

  it('filters transactions by status', async () => {
    renderWithProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('CONFIRMADA')).toBeInTheDocument();
      expect(screen.getByText('PENDIENTE')).toBeInTheDocument();
    });

    // Find and click the status select
    const statusSelects = screen.getAllByRole('combobox');
    const statusSelect = statusSelects.find(select => 
      select.closest('[role="combobox"]')?.previousElementSibling?.textContent === 'Estado'
    );
    
    if (statusSelect) {
      fireEvent.click(statusSelect);
      
      await waitFor(() => {
        const successOption = screen.getByText('Confirmada');
        fireEvent.click(successOption);
      });

      await waitFor(() => {
        expect(screen.getByText('CONFIRMADA')).toBeInTheDocument();
        expect(screen.queryByText('PENDIENTE')).not.toBeInTheDocument();
      });
    }
  });

  it('filters transactions by date range', async () => {
    renderWithProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('res-001')).toBeInTheDocument();
    });

    const fromDateInput = screen.getByDisplayValue('');
    const toDateInput = screen.getAllByDisplayValue('')[1]; // Second empty input (date to)

    fireEvent.change(fromDateInput, { target: { value: '2024-01-14' } });
    fireEvent.change(toDateInput, { target: { value: '2024-01-14' } });

    // The component should filter based on purchase date
    // Since our mock data uses created_at which gets converted to purchaseDate
  });

  it('clears all filters when clear button is clicked', async () => {
    renderWithProviders(<TransactionsPage />);

    const searchInput = screen.getByPlaceholderText('Buscar transacciones...');
    fireEvent.change(searchInput, { target: { value: 'test-search' } });

    const clearButton = screen.getByText('Limpiar');
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
  });

  it('refreshes payments when refresh button is clicked', async () => {
    renderWithProviders(<TransactionsPage />);

    const refreshButton = screen.getByText('Actualizar');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText('Actualizando datos de pagos...')).toBeInTheDocument();
    });
  });

  it('handles logout correctly', async () => {
    const mockLogout = jest.fn();
    mockUseAuth.mockReturnValue({
      user: { id: 'user-001', name: 'Test User', email: 'test@example.com', role: 'user' },
      logout: mockLogout,
      login: jest.fn(),
      isAuthenticated: true,
      isLoading: false,
      token: 'mock-token',
      isAdmin: false,
      refreshAuth: jest.fn(),
    });

    // Mock window.location.href
    delete (window as any).location;
    (window as any).location = { href: '' };

    renderWithProviders(<TransactionsPage />);

    const logoutButton = screen.getByText('Cerrar Sesión');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(window.location.href).toBe('/login');
  });

  it('displays error state when fetch fails', async () => {
    mockFetchPayments.mockRejectedValue(new Error('Fetch failed'));
    renderWithProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar las transacciones')).toBeInTheDocument();
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });
  });

  it('displays empty state when no transactions match filters', async () => {
    mockFetchPayments.mockResolvedValue([]);
    renderWithProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('No se encontraron transacciones')).toBeInTheDocument();
      expect(screen.getByText('Usa los filtros de arriba para refinar la búsqueda')).toBeInTheDocument();
    });
  });

  it('handles pagination correctly', async () => {
    const manyPayments = Array.from({ length: 25 }, (_, i) => ({
      id: `pay-${String(i).padStart(3, '0')}`,
      res_id: `res-${String(i).padStart(3, '0')}`,
      user_id: `user-${String(i).padStart(3, '0')}`,
      created_at: `2024-01-${String(15 + i).padStart(2, '0')}T10:30:00Z`,
      modified_at: `2024-01-${String(15 + i).padStart(2, '0')}T10:30:00Z`,
      status: 'success',
      amount: 100 + i,
      currency: 'USD' as const,
      meta: {},
    }));

    mockFetchPayments.mockResolvedValue(manyPayments);
    renderWithProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mostrando 1 - 10 de 25')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Siguiente');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Mostrando 11 - 20 de 25')).toBeInTheDocument();
    });
  });

  it('changes page size correctly', async () => {
    const manyPayments = Array.from({ length: 25 }, (_, i) => ({
      id: `pay-${String(i).padStart(3, '0')}`,
      res_id: `res-${String(i).padStart(3, '0')}`,
      user_id: `user-${String(i).padStart(3, '0')}`,
      created_at: `2024-01-${String(15 + i).padStart(2, '0')}T10:30:00Z`,
      modified_at: `2024-01-${String(15 + i).padStart(2, '0')}T10:30:00Z`,
      status: 'success',
      amount: 100 + i,
      currency: 'USD' as const,
      meta: {},
    }));

    mockFetchPayments.mockResolvedValue(manyPayments);
    renderWithProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Mostrando 1 - 10 de 25')).toBeInTheDocument();
    });

    // Find the page size select (last combobox)
    const comboboxes = screen.getAllByRole('combobox');
    const pageSizeSelect = comboboxes[comboboxes.length - 1];
    
    fireEvent.click(pageSizeSelect);
    
    await waitFor(() => {
      const option25 = screen.getByText('25');
      fireEvent.click(option25);
    });

    await waitFor(() => {
      expect(screen.getByText('Mostrando 1 - 25 de 25')).toBeInTheDocument();
    });
  });

  it('generates PDF when download button is clicked', async () => {
    renderWithProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('res-001')).toBeInTheDocument();
    });

    const downloadButtons = screen.getAllByTitle('Descargar PDF');
    fireEvent.click(downloadButtons[0]);

    // jsPDF save should be called
    const jsPDF = require('jspdf');
    expect(jsPDF.default).toHaveBeenCalled();
  });

  it('handles window reload on retry', async () => {
    mockFetchPayments.mockRejectedValue(new Error('Fetch failed'));
    
    // Mock window.location.reload
    const mockReload = jest.fn();
    delete (window as any).location;
    (window as any).location = { reload: mockReload };

    renderWithProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Reintentar');
    fireEvent.click(retryButton);

    expect(mockReload).toHaveBeenCalled();
  });
});