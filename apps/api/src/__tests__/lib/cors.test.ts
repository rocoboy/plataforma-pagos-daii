import { NextRequest, NextResponse } from 'next/server';
import { 
  getCorsHeaders, 
  addCorsHeaders, 
  createCorsResponse, 
  createCorsOptionsResponse 
} from '../../lib/cors';

// Mock console.log to avoid noise in tests
jest.spyOn(console, 'log').mockImplementation(() => {});

describe('CORS utilities', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCorsHeaders', () => {
    it('should return CORS headers for allowed origin', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          origin: 'http://localhost:3001'
        }
      });

      const headers = getCorsHeaders(mockRequest);

      expect(headers).toEqual({
        'Access-Control-Allow-Origin': 'http://localhost:3001',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Vary': 'Origin'
      });
    });

    it('should return default origin for disallowed origin', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          origin: 'https://malicious-site.com'
        }
      });

      const headers = getCorsHeaders(mockRequest);

      expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:3001');
    });

    it('should return default origin when no origin header', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {}
      });

      const headers = getCorsHeaders(mockRequest);

      expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:3001');
    });

    it('should handle Vercel preview URLs', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          origin: 'https://plataforma-pagos-daii-web-preprod.vercel.app'
        }
      });

      const headers = getCorsHeaders(mockRequest);

      expect(headers['Access-Control-Allow-Origin']).toBe('https://plataforma-pagos-daii-web-preprod.vercel.app');
    });

    it('should handle Vercel production URLs', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          origin: 'https://plataforma-pagos-daii-web.vercel.app'
        }
      });

      const headers = getCorsHeaders(mockRequest);

      expect(headers['Access-Control-Allow-Origin']).toBe('https://plataforma-pagos-daii-web.vercel.app');
    });
  });

  describe('addCorsHeaders', () => {
    it('should add CORS headers to response', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          origin: 'http://localhost:3001'
        }
      });

      const response = NextResponse.json({ message: 'test' });
      const enhancedResponse = addCorsHeaders(response, mockRequest);

      expect(enhancedResponse.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3001');
      expect(enhancedResponse.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
      expect(enhancedResponse.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
      expect(enhancedResponse.headers.get('Access-Control-Allow-Credentials')).toBe('true');
      expect(enhancedResponse.headers.get('Vary')).toBe('Origin');
    });

    it('should preserve existing headers', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          origin: 'http://localhost:3001'
        }
      });

      const response = NextResponse.json({ message: 'test' });
      response.headers.set('Custom-Header', 'custom-value');
      
      const enhancedResponse = addCorsHeaders(response, mockRequest);

      expect(enhancedResponse.headers.get('Custom-Header')).toBe('custom-value');
      expect(enhancedResponse.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3001');
    });
  });

  describe('createCorsResponse', () => {
    it('should create response with CORS headers and data', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          origin: 'http://localhost:3001'
        }
      });

      const data = { success: true, message: 'test' };
      const response = createCorsResponse(mockRequest, data, 200);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3001');
    });

    it('should create response with custom status code', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          origin: 'http://localhost:3001'
        }
      });

      const data = { error: 'Unauthorized' };
      const response = createCorsResponse(mockRequest, data, 401);

      expect(response.status).toBe(401);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3001');
    });

    it('should log CORS response creation', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          origin: 'http://localhost:3001'
        }
      });

      createCorsResponse(mockRequest, { test: true }, 200);

      expect(consoleSpy).toHaveBeenCalledWith('[CORS] Response -> origin=http://localhost:3001 status=200');
    });
  });

  describe('createCorsOptionsResponse', () => {
    it('should create OPTIONS response with CORS headers', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'OPTIONS',
        headers: {
          origin: 'http://localhost:3001',
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'Content-Type'
        }
      });

      const response = createCorsOptionsResponse(mockRequest);

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3001');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
    });

    it('should handle missing preflight headers', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'OPTIONS',
        headers: {
          origin: 'http://localhost:3001'
        }
      });

      const response = createCorsOptionsResponse(mockRequest);

      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3001');
    });

    it('should log preflight request details', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'OPTIONS',
        headers: {
          origin: 'http://localhost:3001',
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'Content-Type'
        }
      });

      createCorsOptionsResponse(mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith('[CORS] Preflight OPTIONS -> origin=http://localhost:3001 ACRM=POST ACRH=Content-Type');
    });
  });
});
