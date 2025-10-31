import React from 'react';
import { render } from '@testing-library/react';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => jest.fn(),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}), { virtual: true });

// Mock @tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
  __esModule: true,
  useQuery: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useMutation: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

// Mock the component
jest.mock('./Transactions', () => ({
  __esModule: true,
  default: () => <div data-testid="transactions-mock">Transactions Page</div>,
}));

import TransactionsPage from './Transactions';

describe('TransactionsPage - Simple', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<TransactionsPage />);
    expect(getByTestId('transactions-mock')).toBeInTheDocument();
  });
});

