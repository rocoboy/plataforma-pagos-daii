import * as getUserPaymentsModule from './get-user-payments';

describe('Get User Payments - Coverage', () => {
  it('exports getUserPayments function', () => {
    expect(getUserPaymentsModule.getUserPayments).toBeDefined();
    expect(typeof getUserPaymentsModule.getUserPayments).toBe('function');
  });
});

