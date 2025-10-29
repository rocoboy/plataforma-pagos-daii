import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TransactionsPage from '../../pages/Transactions';
import { fetchPayments } from '../../lib/apiClient';

// Mock dependencies
jest.mock('../../lib/apiClient', () => ({
  fetchPayments: jest.fn()
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test User', email: 'test@example.com' },
    logout: jest.fn()
  })
}));

// Mock jsPDF
const mockPDF = {
  setFontSize: jest.fn(),
  setFont: jest.fn(),
  text: jest.fn(),
  save: jest.fn()
};

jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockPDF),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockFetchPayments = fetchPayments as jest.MockedFunction<typeof fetchPayments>;

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

const mockPayments = [
  {
    id: '1',
    res_id: 'RES001',
    user_id: 'user1',
    amount: 100.50,
    status: 'success',
    created_at: '2025-01-15T10:30:00Z'
  },
  {
    id: '2',
    res_id: 'RES002',
    user_id: 'user2',
    amount: 250.75,
    status: 'pending',
    created_at: '2025-01-15T11:00:00Z'
  },
  {
    id: '3',
    res_id: 'RES003',
    user_id: 'user3',
    amount: 75.25,
    status: 'failure',
    created_at: '2025-01-15T12:00:00Z'
  }
];

describe('TransactionsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Loading State', () => {
    it('should show loading spinner while fetching data', () => {
      mockFetchPayments.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithProviders(<TransactionsPage />);

      expect(screen.getByText('Cargando transacciones...')).toBeInTheDocument();
      expect(screen.getByTestId('loader')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when fetch fails', async () => {
      mockFetchPayments.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        expect(screen.getByText('Error al cargar las transacciones')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
      });
    });

    it('should reload page when retry button is clicked', async () => {
      const mockReload = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      });

      mockFetchPayments.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        const retryButton = screen.getByRole('button', { name: 'Reintentar' });
        fireEvent.click(retryButton);
        expect(mockReload).toHaveBeenCalled();
      });
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      mockFetchPayments.mockResolvedValue(mockPayments);
    });

    it('should display transactions in table', async () => {
      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        expect(screen.getByText('RES001')).toBeInTheDocument();
        expect(screen.getByText('RES002')).toBeInTheDocument();
        expect(screen.getByText('RES003')).toBeInTheDocument();
        expect(screen.getByText('$100.50')).toBeInTheDocument();
        expect(screen.getByText('$250.75')).toBeInTheDocument();
        expect(screen.getByText('$75.25')).toBeInTheDocument();
      });
    });

    it('should display status badges correctly', async () => {
      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        expect(screen.getByText('CONFIRMADA')).toBeInTheDocument();
        expect(screen.getByText('PENDIENTE')).toBeInTheDocument();
        expect(screen.getByText('CANCELADA')).toBeInTheDocument();
      });
    });

    it('should format dates correctly', async () => {
      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        // Check for formatted dates (MM/DD/YYYY format)
        expect(screen.getByText('01/15/2025')).toBeInTheDocument();
      });
    });

    it('should display user information in header', async () => {
      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filtering', () => {
    beforeEach(() => {
      mockFetchPayments.mockResolvedValue(mockPayments);
    });

    it('should filter transactions by search term', async () => {
      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Buscar transacciones...');
        fireEvent.change(searchInput, { target: { value: 'RES001' } });

        expect(screen.getByText('RES001')).toBeInTheDocument();
        expect(screen.queryByText('RES002')).not.toBeInTheDocument();
        expect(screen.queryByText('RES003')).not.toBeInTheDocument();
      });
    });

    it('should filter transactions by status', async () => {
      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        const statusSelect = screen.getByRole('combobox');
        fireEvent.click(statusSelect);
        
        const pendingOption = screen.getByText('Pendiente');
        fireEvent.click(pendingOption);

        expect(screen.getByText('RES002')).toBeInTheDocument();
        expect(screen.queryByText('RES001')).not.toBeInTheDocument();
        expect(screen.queryByText('RES003')).not.toBeInTheDocument();
      });
    });

    it('should filter transactions by date range', async () => {
      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        const dateFromInput = screen.getByLabelText('Desde');
        const dateToInput = screen.getByLabelText('Hasta');

        fireEvent.change(dateFromInput, { target: { value: '2025-01-15' } });
        fireEvent.change(dateToInput, { target: { value: '2025-01-15' } });

        // All transactions should be visible as they're all from 2025-01-15
        expect(screen.getByText('RES001')).toBeInTheDocument();
        expect(screen.getByText('RES002')).toBeInTheDocument();
        expect(screen.getByText('RES003')).toBeInTheDocument();
      });
    });

    it('should clear all filters when clear button is clicked', async () => {
      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Buscar transacciones...');
        const clearButton = screen.getByRole('button', { name: 'Limpiar' });

        fireEvent.change(searchInput, { target: { value: 'RES001' } });
        fireEvent.click(clearButton);

        expect(searchInput).toHaveValue('');
        expect(screen.getByText('RES001')).toBeInTheDocument();
        expect(screen.getByText('RES002')).toBeInTheDocument();
        expect(screen.getByText('RES003')).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      // Create more transactions to test pagination
      const manyPayments = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        res_id: `RES${String(i + 1).padStart(3, '0')}`,
        user_id: `user${i + 1}`,
        amount: 100 + i,
        status: 'success',
        created_at: '2025-01-15T10:30:00Z'
      }));
      mockFetchPayments.mockResolvedValue(manyPayments);
    });

    it('should display pagination controls', async () => {
      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        expect(screen.getByText('Mostrando 1 - 10 de 25')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument();
      });
    });

    it('should navigate between pages', async () => {
      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: 'Siguiente' });
        fireEvent.click(nextButton);

        expect(screen.getByText('Mostrando 11 - 20 de 25')).toBeInTheDocument();
      });
    });

    it('should change page size', async () => {
      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        const pageSizeSelect = screen.getByRole('combobox');
        fireEvent.click(pageSizeSelect);
        
        const option25 = screen.getByText('25');
        fireEvent.click(option25);

        expect(screen.getByText('Mostrando 1 - 25 de 25')).toBeInTheDocument();
      });
    });
  });

  describe('PDF Generation', () => {
    beforeEach(() => {
      mockFetchPayments.mockResolvedValue(mockPayments);
    });

    it('should generate PDF for transaction', async () => {
      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        const downloadButtons = screen.getAllByRole('button', { name: /descargar pdf/i });
        fireEvent.click(downloadButtons[0]);
      });

      expect(mockPDF.setFontSize).toHaveBeenCalledWith(20);
      expect(mockPDF.setFont).toHaveBeenCalledWith('helvetica', 'bold');
      expect(mockPDF.text).toHaveBeenCalledWith('SISTEMA DE PAGOS', 20, 20);
      expect(mockPDF.save).toHaveBeenCalled();
    });
  });

  describe('Refresh Functionality', () => {
    beforeEach(() => {
      mockFetchPayments.mockResolvedValue(mockPayments);
    });

    it('should refresh data when refresh button is clicked', async () => {
      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        const refreshButton = screen.getByRole('button', { name: 'Actualizar' });
        fireEvent.click(refreshButton);

        expect(screen.getByText('Actualizando datos de pagos...')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no transactions match filters', async () => {
      mockFetchPayments.mockResolvedValue([]);

      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        expect(screen.getByText('No se encontraron transacciones')).toBeInTheDocument();
        expect(screen.getByText(/No hay transacciones que coincidan con los filtros aplicados/)).toBeInTheDocument();
      });
    });
  });

  describe('Logout Functionality', () => {
    it('should logout and redirect to login', async () => {
      const mockLogout = jest.fn();
      
      // Mock the AuthContext for this specific test
      jest.doMock('../../contexts/AuthContext', () => ({
        useAuth: () => ({
          user: { id: '1', name: 'Test User', email: 'test@example.com' },
          logout: mockLogout
        })
      }));

      // Re-import the component to get the mocked context
      const { default: TransactionsPageWithMock } = await import('../../pages/Transactions');
      
      renderWithProviders(<TransactionsPageWithMock />);

      await waitFor(() => {
        const logoutButton = screen.getByRole('button', { name: 'Cerrar Sesión' });
        fireEvent.click(logoutButton);

        expect(mockLogout).toHaveBeenCalled();
        expect(window.location.href).toBe('/login');
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockFetchPayments.mockResolvedValue(mockPayments);
    });

    it('should have proper table structure', async () => {
      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toBeInTheDocument();

        const headers = screen.getAllByRole('columnheader');
        expect(headers).toHaveLength(7); // All table headers

        const rows = screen.getAllByRole('row');
        expect(rows.length).toBeGreaterThan(1); // Header + data rows
      });
    });

    it('should have accessible form controls', async () => {
      renderWithProviders(<TransactionsPage />);

      await waitFor(() => {
        expect(screen.getByLabelText('Buscar transacciones...')).toBeInTheDocument();
        expect(screen.getByLabelText('Desde')).toBeInTheDocument();
        expect(screen.getByLabelText('Hasta')).toBeInTheDocument();
        expect(screen.getByLabelText('Estado')).toBeInTheDocument();
        expect(screen.getByLabelText('Filas:')).toBeInTheDocument();
      });
    });
  });
});
