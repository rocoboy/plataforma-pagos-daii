import * as paymentsRoute from './route';

describe('Payments Route - Coverage', () => {
  it('exports GET handler', () => {
    expect(paymentsRoute.GET).toBeDefined();
    expect(typeof paymentsRoute.GET).toBe('function');
  });

  it('exports OPTIONS handler', () => {
    expect(paymentsRoute.OPTIONS).toBeDefined();
    expect(typeof paymentsRoute.OPTIONS).toBe('function');
  });
});


