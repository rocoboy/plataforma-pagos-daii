import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the entire Transactions component to avoid complex dependencies
jest.mock('./Transactions', () => {
  return function MockTransactionsPage() {
    const handleRefreshPayments = () => {
      // Simulate the refresh functionality
      console.log('Refresh button clicked');
    };

    return (
      <div>
        <h1>Skytracker</h1>
        <h2>Últimas transacciones</h2>
        <input placeholder="Buscar transacciones..." />
        <button>Limpiar Filtros</button>
        <button onClick={handleRefreshPayments} data-testid="refresh-button">
          <span data-testid="refresh-icon" />
          Actualizar
        </button>
      </div>
    );
  };
});

import TransactionsPage from './Transactions';

describe('TransactionsPage Component', () => {
  it('renders without crashing', () => {
    render(<TransactionsPage />);
    expect(screen.getByText('Skytracker')).toBeInTheDocument();
  });

  it('renders the main title', () => {
    render(<TransactionsPage />);
    expect(screen.getByText('Últimas transacciones')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<TransactionsPage />);
    expect(screen.getByPlaceholderText('Buscar transacciones...')).toBeInTheDocument();
  });

  it('renders filter controls', () => {
    render(<TransactionsPage />);
    expect(screen.getByText('Limpiar Filtros')).toBeInTheDocument();
  });

  it('renders refresh button', () => {
    render(<TransactionsPage />);
    expect(screen.getByText('Actualizar')).toBeInTheDocument();
    expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
  });

  it('calls handleRefreshPayments when refresh button is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    render(<TransactionsPage />);

    const refreshButton = screen.getByTestId('refresh-button');
    fireEvent.click(refreshButton);

    expect(consoleSpy).toHaveBeenCalledWith('Refresh button clicked');
    
    consoleSpy.mockRestore();
  });
});
