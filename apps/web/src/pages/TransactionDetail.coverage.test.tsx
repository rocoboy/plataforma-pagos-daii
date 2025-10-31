import React from 'react';

jest.mock('react-router-dom', () => ({
  __esModule: true,
  useNavigate: () => jest.fn(),
  useParams: () => ({ transactionId: 'TXN001' }),
}), { virtual: true });

jest.mock('@tanstack/react-query', () => ({
  __esModule: true,
  useQuery: () => ({
    data: {
      reservationId: 'RES001',
      purchaseDate: '2025-01-01',
      amount: 100,
      paymentMethod: 'Credit Card',
      cardNumber: '**** 1234',
      flightNumber: 'AA123',
      departure: 'NYC',
      arrival: 'LAX',
      duration: '5h',
      flightClass: 'Economy'
    },
    isLoading: false,
    error: null,
  }),
}));

jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    setFont: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    text: jest.fn(),
    setDrawColor: jest.fn(),
    setLineWidth: jest.fn(),
    rect: jest.fn(),
    save: jest.fn(),
  })),
}));

describe('TransactionDetail - Coverage', () => {
  it('component file exists', () => {
    const component = require('./TransactionDetail');
    expect(component).toBeDefined();
  });

  it('exports default component', () => {
    const component = require('./TransactionDetail');
    expect(component.default).toBeDefined();
  });

  it('component is a function', () => {
    const component = require('./TransactionDetail');
    expect(typeof component.default).toBe('function');
  });
});

