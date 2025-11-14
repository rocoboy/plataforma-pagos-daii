import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders, addCorsHeaders, createCorsResponse, createCorsOptionsResponse } from './cors';

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

  it('getCorsHeaders falls back to default when no origin header', () => {
    const req = new NextRequest('http://localhost:3000', {
      headers: {}
    });
    const headers = getCorsHeaders(req);
    expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:3001');
  });

  it('getCorsHeaders returns vercel origin when allowed', () => {
    const req = new NextRequest('http://localhost:3000', {
      headers: { origin: 'https://plataforma-pagos-daii-web.vercel.app' }
    });
    const headers = getCorsHeaders(req);
    expect(headers['Access-Control-Allow-Origin']).toBe('https://plataforma-pagos-daii-web.vercel.app');
  });

  it('getCorsHeaders returns preprod origin when allowed', () => {
    const req = new NextRequest('http://localhost:3000', {
      headers: { origin: 'https://plataforma-pagos-daii-web-preprod.vercel.app' }
    });
    const headers = getCorsHeaders(req);
    expect(headers['Access-Control-Allow-Origin']).toBe('https://plataforma-pagos-daii-web-preprod.vercel.app');
  });

  it('addCorsHeaders adds CORS headers to response', () => {
    const req = new NextRequest('http://localhost:3000', {
      headers: { origin: 'http://localhost:3001' }
    });
    const response = NextResponse.json({ success: true }, { status: 200 });
    const res = addCorsHeaders(response, req);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3001');
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
    expect(res.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    expect(res.headers.get('Vary')).toBe('Origin');
  });

  it('createCorsResponse adds CORS headers', async () => {
    const req = new NextRequest('http://localhost:3000', {
      headers: { origin: 'http://localhost:3001' }
    });
    const res = createCorsResponse(req, { success: true }, 200);
    expect(res.status).toBe(200);
    const headers = res.headers;
    expect(headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3001');
    expect(headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
  });

  it('createCorsResponse uses default status 200', async () => {
    const req = new NextRequest('http://localhost:3000', {
      headers: { origin: 'http://localhost:3001' }
    });
    const res = createCorsResponse(req, { success: true });
    expect(res.status).toBe(200);
  });

  it('createCorsOptionsResponse returns 204', async () => {
    const req = new NextRequest('http://localhost:3000', { method: 'OPTIONS' });
    const res = createCorsOptionsResponse(req);
    expect(res.status).toBe(204);
  });

  it('createCorsOptionsResponse includes CORS headers', async () => {
    const req = new NextRequest('http://localhost:3000', {
      method: 'OPTIONS',
      headers: { origin: 'http://localhost:3001' }
    });
    const res = createCorsOptionsResponse(req);
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3001');
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
  });
});
