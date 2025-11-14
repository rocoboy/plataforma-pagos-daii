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

  it('handles response with accessToken instead of token', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        accessToken: 'mock-access-token',
        user: { id: '1', email: 'test@test.com', role: 'Usuario' }
      })
    });

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'pass123' })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.token).toBe('mock-access-token');
  });

  it('handles response with usuario instead of user', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        token: 'mock-token',
        usuario: { id: '2', email: 'test2@test.com', rol: 'Admin' }
      })
    });

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test2@test.com', password: 'pass123' })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.user.role).toBe('Admin');
  });

  it('handles response with user in data nested object', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          token: 'mock-token',
          user: { id: '3', email: 'test3@test.com', role: 'Usuario' }
        }
      })
    });

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test3@test.com', password: 'pass123' })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.user.email).toBe('test3@test.com');
  });

  it('handles user mapping with different field names', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        token: 'mock-token',
        user: {
          user_id: '4',
          correo: 'test4@test.com',
          nombre: 'Test User',
          tipo: 'Admin'
        }
      })
    });

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test4@test.com', password: 'pass123' })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.user.id).toBe('4');
    expect(json.user.email).toBe('test4@test.com');
    expect(json.user.name).toBe('Test User');
    expect(json.user.role).toBe('Admin');
  });

  it('handles user from top level fields when no nested user', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        token: 'mock-token',
        id: '5',
        email: 'test5@test.com',
        nombre: 'Test User 5',
        rol: 'Usuario'
      })
    });

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test5@test.com', password: 'pass123' })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.user.id).toBe('5');
    expect(json.user.email).toBe('test5@test.com');
    expect(json.user.name).toBe('Test User 5');
    expect(json.user.role).toBe('Usuario');
  });

  it('handles user extraction from JWT when no user object', async () => {
    // Mock a valid JWT token (3 parts separated by dots)
    // Base64 encode: {"alg":"HS256","typ":"JWT"}.{"id":"6","email":"test6@test.com","nombre":"Test User 6","rol":"Usuario"}
    const mockJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYiLCJlbWFpbCI6InRlc3Q2QHRlc3QuY29tIiwibm9tYnJlIjoiVGVzdCBVc2VyIDYiLCJyb2wiOiJVc3VhcmlvIn0.signature';
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        token: mockJWT
      })
    });

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test6@test.com', password: 'pass123' })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.user).toBeDefined();
  });

  it('handles response with jwt field instead of token', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        jwt: 'mock-jwt-token',
        user: { id: '7', email: 'test7@test.com', role: 'Usuario' }
      })
    });

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test7@test.com', password: 'pass123' })
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.token).toBe('mock-jwt-token');
  });

  it('handles failed login with message', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        mensaje: 'Credenciales inválidas'
      })
    });

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.message).toBe('Credenciales inválidas');
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

