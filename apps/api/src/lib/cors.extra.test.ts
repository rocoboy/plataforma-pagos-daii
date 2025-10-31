import { NextRequest } from 'next/server';
import { createCorsResponse, createCorsOptionsResponse } from './cors';

describe('CORS - Extra Coverage', () => {
  describe('createCorsResponse', () => {
    it('creates response with 201 status', () => {
      const request = new NextRequest('http://localhost/api/test');
      const data = { message: 'Created' };
      const response = createCorsResponse(request, data, 201);
      
      expect(response.status).toBe(201);
    });

    it('creates response with 400 status', () => {
      const request = new NextRequest('http://localhost/api/test');
      const data = { error: 'Bad Request' };
      const response = createCorsResponse(request, data, 400);
      
      expect(response.status).toBe(400);
    });

    it('creates response with 404 status', () => {
      const request = new NextRequest('http://localhost/api/test');
      const data = { error: 'Not Found' };
      const response = createCorsResponse(request, data, 404);
      
      expect(response.status).toBe(404);
    });

    it('creates response with 500 status', () => {
      const request = new NextRequest('http://localhost/api/test');
      const data = { error: 'Internal Server Error' };
      const response = createCorsResponse(request, data, 500);
      
      expect(response.status).toBe(500);
    });

    it('handles empty data', () => {
      const request = new NextRequest('http://localhost/api/test');
      const response = createCorsResponse(request, {}, 200);
      
      expect(response.status).toBe(200);
    });

    it('handles null data', () => {
      const request = new NextRequest('http://localhost/api/test');
      const response = createCorsResponse(request, null as any, 200);
      
      expect(response.status).toBe(200);
    });

    it('handles complex nested data', () => {
      const request = new NextRequest('http://localhost/api/test');
      const data = { user: { id: 1, name: 'Test', roles: ['admin', 'user'] } };
      const response = createCorsResponse(request, data, 200);
      
      expect(response.status).toBe(200);
    });
  });

  describe('createCorsOptionsResponse', () => {
    it('creates OPTIONS response with different methods', () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'PUT',
          'Access-Control-Request-Headers': 'authorization, content-type',
        },
      });
      
      const response = createCorsOptionsResponse(request);
      expect(response.status).toBe(204);
    });

    it('creates OPTIONS response without headers', () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'OPTIONS',
      });
      
      const response = createCorsOptionsResponse(request);
      expect(response.status).toBe(204);
    });

    it('creates OPTIONS response for DELETE method', () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'DELETE',
        },
      });
      
      const response = createCorsOptionsResponse(request);
      expect(response.status).toBe(204);
    });

    it('creates OPTIONS response for PATCH method', () => {
      const request = new NextRequest('http://localhost/api/test', {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'PATCH',
        },
      });
      
      const response = createCorsOptionsResponse(request);
      expect(response.status).toBe(204);
    });
  });
});

