import * as loginRoute from './route';

describe('Auth Login Route - Coverage', () => {
  it('exports POST handler', () => {
    expect(loginRoute.POST).toBeDefined();
    expect(typeof loginRoute.POST).toBe('function');
  });

  it('exports OPTIONS handler', () => {
    expect(loginRoute.OPTIONS).toBeDefined();
    expect(typeof loginRoute.OPTIONS).toBe('function');
  });
});


