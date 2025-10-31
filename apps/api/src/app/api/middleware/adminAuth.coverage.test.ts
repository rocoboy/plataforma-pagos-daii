import { adminAuthMiddleware } from './adminAuth';

describe('adminAuthMiddleware - Coverage', () => {
  it('exports adminAuthMiddleware function', () => {
    expect(adminAuthMiddleware).toBeDefined();
    expect(typeof adminAuthMiddleware).toBe('function');
  });
});


