describe('Get User Payments - Coverage', () => {
  it('exports getUserPayments function', () => {
    const module = require('./get-user-payments');
    expect(module.getUserPayments).toBeDefined();
    expect(typeof module.getUserPayments).toBe('function');
  });
});

