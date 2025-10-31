describe('Get Payment - Coverage', () => {
  it('exports getPayment function', () => {
    const module = require('./get-payment');
    expect(module.getPayment).toBeDefined();
    expect(typeof module.getPayment).toBe('function');
  });
});

