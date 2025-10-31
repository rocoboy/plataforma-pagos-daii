import * as getPaymentModule from './get-payment';

describe('Get Payment - Coverage', () => {
  it('exports getPayment function', () => {
    expect(getPaymentModule.getPayment).toBeDefined();
    expect(typeof getPaymentModule.getPayment).toBe('function');
  });
});

