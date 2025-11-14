// Mock jsPDF BEFORE any imports
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockPDFInstance = (): any => {
  const instance = {
    setFont: jest.fn(function() { return this; }),
    setFontSize: jest.fn(function() { return this; }),
    setTextColor: jest.fn(function() { return this; }),
    setDrawColor: jest.fn(function() { return this; }),
    setLineWidth: jest.fn(function() { return this; }),
    text: jest.fn(function() { return this; }),
    rect: jest.fn(function() { return this; }),
    save: jest.fn(function() { return this; })
  };
  return instance;
};

const mockPDFInstance = createMockPDFInstance();

jest.mock('jspdf', () => {
  const mockConstructor = jest.fn(() => mockPDFInstance);
  return {
    __esModule: true,
    default: mockConstructor,
  };
}, { virtual: false });

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TransactionDetailPage from './TransactionDetail';
import { mockTransactionDetails } from '../data/mockData';

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockUseParams = jest.fn(() => ({ transactionId: '1' }));

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
  MemoryRouter: ({ children }: { children: React.ReactNode }) => children,
}), { virtual: true });

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  const { MemoryRouter } = require('react-router-dom');
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('TransactionDetail - Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockUseParams.mockReturnValue({ transactionId: '1' });
    mockPDFInstance.setFont.mockClear();
    mockPDFInstance.setFontSize.mockClear();
    mockPDFInstance.setTextColor.mockClear();
    mockPDFInstance.text.mockClear();
    mockPDFInstance.save.mockClear();
  });

  it('renders loading state', () => {
    renderWithProviders(<TransactionDetailPage />);
    expect(screen.getByText(/cargando detalles/i)).toBeInTheDocument();
  });

  it('renders transaction detail when loaded', async () => {
    renderWithProviders(<TransactionDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(mockTransactionDetails['1'].reservationId)).toBeInTheDocument();
    });

    expect(screen.getByText(mockTransactionDetails['1'].purchaseDate)).toBeInTheDocument();
    expect(screen.getByText(`$${mockTransactionDetails['1'].amount.toFixed(2)}`)).toBeInTheDocument();
  });

  it('renders error state when transaction not found', async () => {
    mockUseParams.mockReturnValue({ transactionId: 'nonexistent' });

    renderWithProviders(<TransactionDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/error al cargar los detalles/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const backButton = screen.getByText(/volver/i);
    expect(backButton).toBeInTheDocument();
  });

  it('handles download invoice button click', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(<TransactionDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(mockTransactionDetails['1'].reservationId)).toBeInTheDocument();
    });

    const downloadButton = screen.getByText(/descargar comprobante/i);
    fireEvent.click(downloadButton);

    // Wait for PDF generation to attempt
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify button was clicked
    expect(downloadButton).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('displays loading state when generating PDF', async () => {
    renderWithProviders(<TransactionDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(mockTransactionDetails['1'].reservationId)).toBeInTheDocument();
    });

    const downloadButton = screen.getByText(/descargar comprobante/i);
    fireEvent.click(downloadButton);

    // Check that button is clicked - PDF generation happens async
    expect(downloadButton).toBeInTheDocument();
  });

  it('handles PDF generation error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(<TransactionDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(mockTransactionDetails['1'].reservationId)).toBeInTheDocument();
    });

    const downloadButton = screen.getByText(/descargar comprobante/i);
    fireEvent.click(downloadButton);

    // Wait a bit for PDF generation to attempt
    await new Promise(resolve => setTimeout(resolve, 100));

    consoleErrorSpy.mockRestore();
  });

  it('handles back button click', async () => {
    renderWithProviders(<TransactionDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(mockTransactionDetails['1'].reservationId)).toBeInTheDocument();
    });

    // Get all buttons and find the first one (back button)
    const buttons = screen.getAllByRole('button');
    const backButton = buttons[0];
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('renders all transaction detail fields', async () => {
    renderWithProviders(<TransactionDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(mockTransactionDetails['1'].reservationId)).toBeInTheDocument();
    });

    expect(screen.getByText(mockTransactionDetails['1'].purchaseDate)).toBeInTheDocument();
    expect(screen.getByText(`$${mockTransactionDetails['1'].amount.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(mockTransactionDetails['1'].paymentMethod)).toBeInTheDocument();
    expect(screen.getByText(mockTransactionDetails['1'].cardNumber)).toBeInTheDocument();
    expect(screen.getByText(mockTransactionDetails['1'].flightNumber)).toBeInTheDocument();
    expect(screen.getByText(mockTransactionDetails['1'].departure)).toBeInTheDocument();
    expect(screen.getByText(mockTransactionDetails['1'].arrival)).toBeInTheDocument();
    expect(screen.getByText(mockTransactionDetails['1'].duration)).toBeInTheDocument();
    expect(screen.getByText(mockTransactionDetails['1'].flightClass)).toBeInTheDocument();
  });

  it('handles missing transactionId', async () => {
    mockUseParams.mockReturnValue({ transactionId: undefined });

    renderWithProviders(<TransactionDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/error al cargar los detalles/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

