import { NextRequest } from 'next/server';
import { middleware } from './middleware';

jest.mock('@/lib/cors', () => ({
  addCorsHeaders: jest.fn((response) => response),
  createCorsOptionsResponse: jest.fn(() => ({
    status: 204,
    headers: new Headers({ 'Access-Control-Allow-Origin': '*' })
  }))
}));

describe('middleware', () => {
  it('handles OPTIONS preflight request', () => {
    const req = new NextRequest('http://localhost/api/test', { method: 'OPTIONS' });
    const response = middleware(req);
    expect(response).toBeTruthy();
  });

  it('handles GET request with CORS headers', () => {
    const req = new NextRequest('http://localhost/api/test', { method: 'GET' });
    const response = middleware(req);
    expect(response).toBeTruthy();
  });

  it('handles POST request with CORS headers', () => {
    const req = new NextRequest('http://localhost/api/test', { method: 'POST' });
    const response = middleware(req);
    expect(response).toBeTruthy();
  });
});

