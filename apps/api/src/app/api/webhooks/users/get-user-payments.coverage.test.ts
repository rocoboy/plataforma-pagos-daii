import * as userPaymentsModule from './get-user-payments';

describe('Webhooks Get User Payments - Coverage', () => {
  it('exports getUserPayments function', () => {
    expect(userPaymentsModule.getUserPayments).toBeDefined();
    expect(typeof userPaymentsModule.getUserPayments).toBe('function');
  });
});

 