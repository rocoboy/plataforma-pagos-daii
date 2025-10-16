import { mockTransactionDetails } from '../../data/mockData';

describe('mockTransactionDetails', () => {
  it('contains transaction with ID 1', () => {
    expect(mockTransactionDetails['1']).toBeDefined();
  });

  it('transaction 1 has all required fields', () => {
    const txn = mockTransactionDetails['1'];
    
    expect(txn.reservationId).toBeDefined();
    expect(txn.purchaseDate).toBeDefined();
    expect(txn.amount).toBeGreaterThan(0);
    expect(txn.paymentMethod).toBeDefined();
    expect(txn.cardNumber).toBeDefined();
    expect(txn.flightNumber).toBeDefined();
  });

  it('contains transaction with ID 2', () => {
    expect(mockTransactionDetails['2']).toBeDefined();
  });

  it('transaction 2 has all required fields', () => {
    const txn = mockTransactionDetails['2'];
    
    expect(txn.reservationId).toBeDefined();
    expect(txn.purchaseDate).toBeDefined();
    expect(txn.amount).toBeGreaterThan(0);
    expect(txn.paymentMethod).toBeDefined();
  });

  it('contains transaction with ID 3', () => {
    expect(mockTransactionDetails['3']).toBeDefined();
  });

  it('all transactions have valid amount format', () => {
    Object.values(mockTransactionDetails).forEach(txn => {
      expect(typeof txn.amount).toBe('number');
      expect(txn.amount).toBeGreaterThan(0);
    });
  });

  it('all transactions have purchase dates', () => {
    Object.values(mockTransactionDetails).forEach(txn => {
      expect(txn.purchaseDate).toBeDefined();
      expect(txn.purchaseDate.length).toBeGreaterThan(0);
    });
  });

  it('all transactions have flight information', () => {
    Object.values(mockTransactionDetails).forEach(txn => {
      expect(txn.flightNumber).toBeDefined();
      expect(txn.departure).toBeDefined();
      expect(txn.arrival).toBeDefined();
      expect(txn.duration).toBeDefined();
      expect(txn.flightClass).toBeDefined();
    });
  });

  it('all transactions have payment information', () => {
    Object.values(mockTransactionDetails).forEach(txn => {
      expect(txn.paymentMethod).toBeDefined();
      expect(txn.cardNumber).toBeDefined();
    });
  });

  it('has correct number of mock transactions', () => {
    const count = Object.keys(mockTransactionDetails).length;
    expect(count).toBeGreaterThanOrEqual(3);
  });

  it('transaction IDs match reservation IDs', () => {
    Object.entries(mockTransactionDetails).forEach(([id, txn]) => {
      expect(txn.reservationId).toContain(id);
    });
  });
});

