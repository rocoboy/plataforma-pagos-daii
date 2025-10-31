import { NextRequest } from 'next/server';
import { POST, OPTIONS } from './route';

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

describe('/api/auth/login', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('POST', () => {
    it('handles successful login', async () => {
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
    });

    it('handles failed login', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ success: false, message: 'Invalid credentials' })
      });

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
      });

      const response = await POST(req);
      expect(response.status).toBe(401);
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'pass123' })
      });

      const response = await POST(req);
      expect(response.status).toBe(500);
    });
  });

  describe('OPTIONS', () => {
    it('returns CORS preflight response', async () => {
      const req = new NextRequest('http://localhost/api/auth/login', {
        method: 'OPTIONS'
      });

      const response = await OPTIONS(req);
      expect(response.status).toBe(204);
    });
  });
});

