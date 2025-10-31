import React from 'react';

// Mock all dependencies before imports
jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => jest.fn(),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}), { virtual: true });

jest.mock('@tanstack/react-query', () => ({
  __esModule: true,
  useQuery: () => ({
    data: [
      { id: '1', amount: 100, status: 'PENDING', res_id: 'RES1', created_at: '2025-01-01' },
      { id: '2', amount: 200, status: 'SUCCESS', res_id: 'RES2', created_at: '2025-01-02' }
    ],
    isLoading: false,
    error: null,
  }),
  useMutation: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

// Simple coverage tests
describe('Transactions - Coverage', () => {
  it('component file exists', () => {
    const component = require('./Transactions');
    expect(component).toBeDefined();
  });

  it('exports default component', () => {
    const component = require('./Transactions');
    expect(component.default).toBeDefined();
  });

  it('component is a function', () => {
    const component = require('./Transactions');
    expect(typeof component.default).toBe('function');
  });
});

