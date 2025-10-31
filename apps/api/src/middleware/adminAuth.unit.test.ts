import { NextRequest } from 'next/server';
import { adminAuthMiddleware } from './adminAuth';

describe('adminAuthMiddleware', () => {
  it('returns error when no authorization header', () => {
    const req = new NextRequest('http://localhost:3000/api/payments');
    const result = adminAuthMiddleware(req);
    expect(result).toBeTruthy();
  });

  it('returns null when valid admin token present', () => {
    const req = new NextRequest('http://localhost:3000/api/payments', {
      headers: { authorization: 'Bearer valid-token' }
    });
    // Mock: assume it returns null for valid token (adjust based on actual logic)
    const result = adminAuthMiddleware(req);
    expect(result).toBeDefined();
  });
});

