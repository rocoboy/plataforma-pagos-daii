import { NextRequest } from 'next/server';
import { adminAuthMiddleware } from './adminAuth';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

jest.mock('@/lib/cors', () => ({
  createCorsResponse: jest.fn((req, data, status) => ({ status, data })),
}));

describe('AdminAuth Middleware - Extra Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  it('handles token with user role (not admin)', () => {
    (jwt.verify as jest.Mock).mockReturnValue({ rol: 'user' });

    const request = new NextRequest('http://localhost/api/test', {
      headers: { authorization: 'Bearer user-token' },
    });

    const response = adminAuthMiddleware(request);
    expect(response.status).toBe(403);
  });

  it('handles empty bearer token', () => {
    const request = new NextRequest('http://localhost/api/test', {
      headers: { authorization: 'Bearer ' },
    });

    const response = adminAuthMiddleware(request);
    expect(response.status).toBe(401);
  });

  it('handles malformed authorization header', () => {
    const request = new NextRequest('http://localhost/api/test', {
      headers: { authorization: 'InvalidHeader' },
    });

    const response = adminAuthMiddleware(request);
    expect(response.status).toBe(401);
  });

  it('handles JWT verification error', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const request = new NextRequest('http://localhost/api/test', {
      headers: { authorization: 'Bearer invalid-token' },
    });

    const response = adminAuthMiddleware(request);
    expect(response.status).toBe(401);
  });

  it('handles token without rol field', () => {
    (jwt.verify as jest.Mock).mockReturnValue({ userId: '123' });

    const request = new NextRequest('http://localhost/api/test', {
      headers: { authorization: 'Bearer token-without-role' },
    });

    const response = adminAuthMiddleware(request);
    expect(response.status).toBe(403);
  });
});

