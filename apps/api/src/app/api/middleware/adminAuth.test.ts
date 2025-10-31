import { NextRequest } from 'next/server';
import { adminAuthMiddleware } from './adminAuth';

jest.mock('jsonwebtoken', () => ({
  decode: jest.fn(() => ({ header: {}, payload: { rol: 'admin' } })),
  verify: jest.fn(() => ({ rol: 'admin' }))
}));

jest.mock('@/lib/cors', () => ({
  createCorsResponse: jest.fn((req, data, status) => ({
    status,
    json: async () => data
  }))
}));

describe('adminAuthMiddleware', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('returns error when no auth header', () => {
    const req = new NextRequest('http://localhost/api/payments');
    const result = adminAuthMiddleware(req);
    expect(result).toBeTruthy();
  });

  it('returns null when valid admin token', () => {
    const req = new NextRequest('http://localhost/api/payments', {
      headers: { authorization: 'Bearer valid-admin-token' }
    });
    const result = adminAuthMiddleware(req);
    expect(result).toBeNull();
  });

  it('handles invalid token format', () => {
    const req = new NextRequest('http://localhost/api/payments', {
      headers: { authorization: 'InvalidFormat' }
    });
    const result = adminAuthMiddleware(req);
    expect(result).toBeTruthy();
  });
});

