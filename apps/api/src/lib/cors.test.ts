import { NextRequest } from 'next/server';
import { getCorsHeaders, createCorsResponse, createCorsOptionsResponse } from './cors';

describe('cors helpers', () => {
  it('getCorsHeaders returns correct origin when allowed', () => {
    const req = new NextRequest('http://localhost:3000', {
      headers: { origin: 'http://localhost:3001' }
    });
    const headers = getCorsHeaders(req);
    expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:3001');
  });

  it('getCorsHeaders falls back to default when origin not allowed', () => {
    const req = new NextRequest('http://localhost:3000', {
      headers: { origin: 'http://evil.com' }
    });
    const headers = getCorsHeaders(req);
    expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:3001');
  });

  it('createCorsResponse returns response with CORS headers', () => {
    const req = new NextRequest('http://localhost:3000');
    const res = createCorsResponse(req, { success: true });
    expect(res.status).toBe(200);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
  });

  it('createCorsOptionsResponse returns 204', () => {
    const req = new NextRequest('http://localhost:3000', { method: 'OPTIONS' });
    const res = createCorsOptionsResponse(req);
    expect(res.status).toBe(204);
  });
});

