import { mockTransactions, mockTransactionDetails } from './mockData';

describe('mockData', () => {
  it('exports mockTransactions array', () => {
    expect(Array.isArray(mockTransactions)).toBe(true);
    expect(mockTransactions.length).toBeGreaterThan(0);
  });

  it('exports mockTransactionDetails object', () => {
    expect(typeof mockTransactionDetails).toBe('object');
    expect(Object.keys(mockTransactionDetails).length).toBeGreaterThan(0);
  });

  it('mockTransactions contain id and amount', () => {
    const first = mockTransactions[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('amount');
  });
});

