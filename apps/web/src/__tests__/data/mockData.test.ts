import { mockTransactions, mockTransactionDetails } from '../../data/mockData';

describe('Mock Data', () => {
  describe('mockTransactions', () => {
    it('contains valid transaction data', () => {
      expect(mockTransactions).toBeDefined();
      expect(Array.isArray(mockTransactions)).toBe(true);
      expect(mockTransactions.length).toBeGreaterThan(0);
    });

    it('has transactions with required fields', () => {
      mockTransactions.forEach((transaction) => {
        expect(transaction.id).toBeDefined();
        expect(transaction.reservationId).toBeDefined();
        expect(transaction.userId).toBeDefined();
        expect(transaction.amount).toBeDefined();
        expect(typeof transaction.amount).toBe('number');
        expect(transaction.amount).toBeGreaterThan(0);
      });
    });

    it('has valid status values', () => {
      const validStatuses = ['confirmado', 'pendiente', 'cancelado'];
      mockTransactions.forEach((transaction) => {
        expect(validStatuses).toContain(transaction.status);
      });
    });
  });

  describe('mockTransactionDetails', () => {
    it('contains valid transaction detail data', () => {
      expect(mockTransactionDetails).toBeDefined();
      expect(typeof mockTransactionDetails).toBe('object');
      expect(Object.keys(mockTransactionDetails).length).toBeGreaterThan(0);
    });

    it('has transaction details with required fields', () => {
      Object.values(mockTransactionDetails).forEach((detail) => {
        expect(detail.id).toBeDefined();
        expect(detail.reservationId).toBeDefined();
        expect(detail.amount).toBeDefined();
        expect(typeof detail.amount).toBe('number');
        expect(detail.amount).toBeGreaterThan(0);
        expect(detail.paymentMethod).toBeDefined();
        expect(detail.flightNumber).toBeDefined();
      });
    });
  });
});
