import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock external dependencies
jest.mock('@/lib/cors', () => ({
  createCorsResponse: jest.fn((req, data, status) => ({
    status,
    json: async () => data
  })),
  createCorsOptionsResponse: jest.fn(() => ({
    status: 204
  }))
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('/api/auth/login - Coverage Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('User mapping from top-level fields', () => {
    it('handles user mapping when userRaw is null but top-level fields exist', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          token: 'mock-token',
          id: 'top-id',
          email: 'top@email.com',
          nombre: 'Top Name',
          rol: 'Admin'
        })
      });

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'pass123' })
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.user.id).toBe('top-id');
      expect(json.user.email).toBe('top@email.com');
      expect(json.user.name).toBe('Top Name');
      expect(json.user.role).toBe('Admin');
    });

    it('handles user mapping when only email exists in top-level', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          token: 'mock-token',
          correo: 'correo@email.com'
          // correo exists, so user will be created
        })
      });

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'pass123' })
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.user.email).toBe('correo@email.com');
      expect(json.user.id).toBe('unknown'); // topId defaults to 'unknown' when no id/user_id/uid
      expect(json.user.role).toBe('Usuario'); // topRole defaults to 'Usuario' when undefined
    });

    it('handles user mapping when only role exists in top-level', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          token: 'mock-token',
          tipo: 'Usuario'
        })
      });

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'pass123' })
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.user.role).toBe('Usuario');
    });

    it('handles JWT decoding when token has 3 parts but user is missing', async () => {
      // Create a valid JWT format
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const payload = Buffer.from(JSON.stringify({
        id: 'jwt-id',
        email: 'jwt@email.com',
        nombre: 'JWT Name',
        rol: 'Usuario'
      })).toString('base64');
      const jwtToken = `${header}.${payload}.signature`;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          token: jwtToken
        })
      });

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'pass123' })
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.user).toBeDefined();
      expect(json.user.id).toBe('jwt-id');
    });

    it('handles JWT decoding failure gracefully', async () => {
      // Invalid JWT format (not 3 parts) - JWT decoding will not be attempted
      // Since token.split('.').length !== 3, the JWT decoding block is skipped
      // No user, no top-level fields, so user will be null
      // success = Boolean(response.ok && token && user) = Boolean(true && true && null) = false
      const invalidJWT = 'invalid.jwt';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          token: invalidJWT
          // No user, no top-level fields
        })
      });

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'pass123' })
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      // Since user is null (no user, no top-level fields, JWT not decoded), success should be false
      expect(json.success).toBe(false);
      expect(json.message).toBeDefined();
    });

    it('handles response with msg field for message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          msg: 'Error message'
        })
      });

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
      });

      const response = await POST(req);
      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.message).toBe('Error message');
    });

    it('handles response with success message when ok is true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          token: 'mock-token',
          user: { id: '1', email: 'test@test.com', role: 'Usuario' }
        })
      });

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'pass123' })
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
    });

    it('handles response with default error message when ok is false and no message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({})
      });

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'pass123' })
      });

      const response = await POST(req);
      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.message).toBe('Error de autenticación');
    });
  });
});

