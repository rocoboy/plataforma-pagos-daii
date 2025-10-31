import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('@tanstack/react-query', () => ({
  __esModule: true,
  useQuery: jest.fn(() => ({ data: [
    { id: '1', res_id: 'RES001', user_id: 'u1', amount: 10.5, status: 'success', created_at: '2025-01-01T00:00:00Z' }
  ], isLoading: false, error: null }),
  useQueryClient: () => ({ invalidateQueries: jest.fn() })
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Test User' }, logout: jest.fn() })
}));

jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    save: jest.fn()
  }))
}));

import TransactionsPage from './Transactions';

describe('TransactionsPage (simple)', () => {
  it('renders table with one row', async () => {
    render(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Transacciones')).toBeInTheDocument();
      expect(screen.getByText('RES001')).toBeInTheDocument();
    });
  });
});
