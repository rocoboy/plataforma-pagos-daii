import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// We need to import the StatusBadge component from Transactions
// Since it's not exported, we'll test it through the main component
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import TransactionsPage from '../../pages/Transactions';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPayments } from '../../lib/apiClient';

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

// Helper function to create mock payment
const createMockPayment = (id: string, status: string | null, amount = 100) => ({
  id,
  res_id: `res-${id}`,
  user_id: `user-${id}`,
  created_at: '2024-01-15T10:30:00Z',
  modified_at: '2024-01-15T10:30:00Z',
  status,
  amount,
  currency: 'USD' as const,
  meta: {},
});

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

describe('StatusBadge Component (through TransactionsPage)', () => {
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
  });

  it('displays correct badge for success status', async () => {
    mockFetchPayments.mockResolvedValue([createMockPayment('pay-001', 'success', 150.50)]);

    renderWithProviders(<TransactionsPage />);
    
    await screen.findByText('CONFIRMADA');
    expect(screen.getByText('CONFIRMADA')).toBeInTheDocument();
  });

  it('displays correct badge for pending status', async () => {
    mockFetchPayments.mockResolvedValue([createMockPayment('pay-002', 'pending', 299.99)]);

    renderWithProviders(<TransactionsPage />);
    
    await screen.findByText('PENDIENTE');
    expect(screen.getByText('PENDIENTE')).toBeInTheDocument();
  });

  it('displays correct badge for failure status', async () => {
    mockFetchPayments.mockResolvedValue([createMockPayment('pay-003', 'failure', 75.25)]);

    renderWithProviders(<TransactionsPage />);
    
    await screen.findByText('CANCELADA');
    expect(screen.getByText('CANCELADA')).toBeInTheDocument();
  });

  it('displays correct badge for refund status', async () => {
    mockFetchPayments.mockResolvedValue([createMockPayment('pay-004', 'refund', 200.00)]);

    renderWithProviders(<TransactionsPage />);
    
    await screen.findByText('REEMBOLSADA');
    expect(screen.getByText('REEMBOLSADA')).toBeInTheDocument();
  });

  it('displays correct badge for underpaid status', async () => {
    mockFetchPayments.mockResolvedValue([createMockPayment('pay-005', 'underpaid', 50.00)]);

    renderWithProviders(<TransactionsPage />);
    
    await screen.findByText('PAGO INSUFICIENTE');
    expect(screen.getByText('PAGO INSUFICIENTE')).toBeInTheDocument();
  });

  it('displays correct badge for overpaid status', async () => {
    mockFetchPayments.mockResolvedValue([createMockPayment('pay-006', 'overpaid', 500.00)]);

    renderWithProviders(<TransactionsPage />);
    
    await screen.findByText('SOBREPAGO'); 
    expect(screen.getByText('SOBREPAGO')).toBeInTheDocument();
  });

  it('displays correct badge for expired status', async () => {
    mockFetchPayments.mockResolvedValue([createMockPayment('pay-007', 'expired', 100.00)]);

    renderWithProviders(<TransactionsPage />);
    
    await screen.findByText('EXPIRADA');
    expect(screen.getByText('EXPIRADA')).toBeInTheDocument();
  });

  it('displays correct badge for unknown status', async () => {
    mockFetchPayments.mockResolvedValue([createMockPayment('pay-008', 'unknown_status', 123.45)]);

    renderWithProviders(<TransactionsPage />);
    
    await screen.findByText('UNKNOWN_STATUS');
    expect(screen.getByText('UNKNOWN_STATUS')).toBeInTheDocument();
  });

  it('handles null status correctly', async () => {
    mockFetchPayments.mockResolvedValue([createMockPayment('pay-009', null, 99.99)]);

    renderWithProviders(<TransactionsPage />);
    
    await screen.findByText('DESCONOCIDO');
    expect(screen.getByText('DESCONOCIDO')).toBeInTheDocument();
  });
});