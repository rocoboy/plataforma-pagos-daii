import { NextRequest } from 'next/server';
import { adminAuthMiddleware } from './adminAuth';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  decode: jest.fn(),
}));

jest.mock('@/lib/cors', () => ({
  createCorsResponse: jest.fn((req, data, status) => ({
    status,
    json: async () => data,
    headers: new Headers()
  })),
}));

describe('AdminAuth Middleware - Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('handles missing auth header', () => {
    const request = new NextRequest('http://localhost/api/test');
    const response = adminAuthMiddleware(request);
    expect(response).not.toBeNull();
    expect(response.status).toBe(401);
  });

  it('handles auth header that does not start with Bearer', () => {
    const request = new NextRequest('http://localhost/api/test', {
      headers: { authorization: 'Basic token123' }
    });
    const response = adminAuthMiddleware(request);
    expect(response).not.toBeNull();
    expect(response.status).toBe(401);
  });

  it('handles empty Bearer token', () => {
    const request = new NextRequest('http://localhost/api/test', {
      headers: { authorization: 'Bearer ' }
    });
    const response = adminAuthMiddleware(request);
    expect(response).not.toBeNull();
    expect(response.status).toBe(401);
  });

  it('handles JWT decode returning null', () => {
    (jwt.decode as jest.Mock).mockReturnValue(null);
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const request = new NextRequest('http://localhost/api/test', {
      headers: { authorization: 'Bearer invalid-token' }
    });
    const response = adminAuthMiddleware(request);
    expect(response).not.toBeNull();
    expect(response.status).toBe(401);
  });

  it('handles JWT decode returning undefined header', () => {
    (jwt.decode as jest.Mock).mockReturnValue({
      header: undefined,
      payload: { rol: 'admin' }
    });
    (jwt.verify as jest.Mock).mockReturnValue({ rol: 'admin' });

    const request = new NextRequest('http://localhost/api/test', {
      headers: { authorization: 'Bearer valid-token' }
    });
    const response = adminAuthMiddleware(request);
    expect(response).toBeNull();
  });

  it('handles JWT decode returning undefined payload', () => {
    (jwt.decode as jest.Mock).mockReturnValue({
      header: {},
      payload: undefined
    });
    (jwt.verify as jest.Mock).mockReturnValue({ rol: 'admin' });

    const request = new NextRequest('http://localhost/api/test', {
      headers: { authorization: 'Bearer valid-token' }
    });
    const response = adminAuthMiddleware(request);
    expect(response).toBeNull();
  });

  it('handles token with missing rol field', () => {
    (jwt.decode as jest.Mock).mockReturnValue({
      header: {},
      payload: {}
    });
    (jwt.verify as jest.Mock).mockReturnValue({});

    const request = new NextRequest('http://localhost/api/test', {
      headers: { authorization: 'Bearer token-without-rol' }
    });
    const response = adminAuthMiddleware(request);
    expect(response).not.toBeNull();
    expect(response.status).toBe(403);
  });

  it('handles token with undefined rol', () => {
    (jwt.decode as jest.Mock).mockReturnValue({
      header: {},
      payload: { rol: undefined }
    });
    (jwt.verify as jest.Mock).mockReturnValue({ rol: undefined });

    const request = new NextRequest('http://localhost/api/test', {
      headers: { authorization: 'Bearer token-undefined-rol' }
    });
    const response = adminAuthMiddleware(request);
    expect(response).not.toBeNull();
    expect(response.status).toBe(403);
  });

  it('handles JWT verification throwing different error types', () => {
    (jwt.decode as jest.Mock).mockReturnValue({
      header: {},
      payload: { rol: 'admin' }
    });
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new TypeError('Token expired');
    });

    const request = new NextRequest('http://localhost/api/test', {
      headers: { authorization: 'Bearer expired-token' }
    });
    const response = adminAuthMiddleware(request);
    expect(response).not.toBeNull();
    expect(response.status).toBe(401);
  });
});

