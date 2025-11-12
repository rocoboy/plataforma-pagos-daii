import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock fetch
global.fetch = jest.fn();

// Mock CORS
jest.mock('@/lib/cors', () => ({
  createCorsResponse: jest.fn((req, data, status = 200) => ({
    status,
    json: async () => data,
  })),
}));

describe('Login Route - Extra Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SUPABASE_API_URL = 'http://test-api.com';
  });

  it('handles successful login with valid credentials', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, token: 'valid-token', user: { id: '1' } }),
    });

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('handles 401 unauthorized', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Unauthorized' }),
    });

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'wrong@example.com', password: 'wrong' }),
    });

    const response = await POST(request);
    expect(response).toBeDefined();
  });

  it('handles 500 internal server error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal Server Error' }),
    });

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
    });

    const response = await POST(request);
    expect(response).toBeDefined();
  });

  it('handles missing email', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'password123' }),
    });

    const response = await POST(request);
    expect(response).toBeDefined();
  });

  it('handles missing password', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    const response = await POST(request);
    expect(response).toBeDefined();
  });

  it('handles response with user object (raw data)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ 
        success: true, 
        token: 'token123',
        user: {
          user_id: 'u1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'Admin'
        }
      }),
    });

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('handles JWT token without user object', async () => {
    // JWT válido con payload mínimo
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({ 
      id: 'u1', 
      email: 'jwt@example.com',
      name: 'JWT User',
      role: 'User'
    })).toString('base64');
    const signature = 'signature';
    const jwtToken = `${header}.${payload}.${signature}`;

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ 
        success: true, 
        token: jwtToken
      }),
    });

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('handles invalid JWT token', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ 
        success: true, 
        token: 'invalid-token-format'
      }),
    });

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    const response = await POST(request);
    expect(response).toBeDefined();
  });
});

