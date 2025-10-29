import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../../middleware';
import { addCorsHeaders, createCorsOptionsResponse } from '../../lib/cors';

// Mock the cors module
jest.mock('../../lib/cors', () => ({
  addCorsHeaders: jest.fn(),
  createCorsOptionsResponse: jest.fn()
}));

describe('middleware', () => {
  let mockRequest: NextRequest;
  const mockAddCorsHeaders = addCorsHeaders as jest.MockedFunction<typeof addCorsHeaders>;
  const mockCreateCorsOptionsResponse = createCorsOptionsResponse as jest.MockedFunction<typeof createCorsOptionsResponse>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('OPTIONS requests', () => {
    it('should handle OPTIONS requests with CORS preflight response', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'OPTIONS',
        headers: {
          origin: 'http://localhost:3001',
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'Content-Type'
        }
      });

      const mockResponse = new NextResponse(null, { status: 204 });
      mockCreateCorsOptionsResponse.mockReturnValue(mockResponse);

      const result = middleware(mockRequest);

      expect(mockCreateCorsOptionsResponse).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(mockResponse);
    });

    it('should handle OPTIONS requests without preflight headers', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'OPTIONS',
        headers: {
          origin: 'http://localhost:3001'
        }
      });

      const mockResponse = new NextResponse(null, { status: 204 });
      mockCreateCorsOptionsResponse.mockReturnValue(mockResponse);

      const result = middleware(mockRequest);

      expect(mockCreateCorsOptionsResponse).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(mockResponse);
    });
  });

  describe('non-OPTIONS requests', () => {
    it('should add CORS headers to GET requests', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          origin: 'http://localhost:3001'
        }
      });

      const mockResponse = new NextResponse('test response');
      const enhancedResponse = new NextResponse('test response with CORS');
      mockAddCorsHeaders.mockReturnValue(enhancedResponse);

      const result = middleware(mockRequest);

      expect(mockAddCorsHeaders).toHaveBeenCalledWith(expect.any(NextResponse), mockRequest);
      expect(result).toBe(enhancedResponse);
    });

    it('should add CORS headers to POST requests', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3001',
          'content-type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      });

      const mockResponse = new NextResponse('test response');
      const enhancedResponse = new NextResponse('test response with CORS');
      mockAddCorsHeaders.mockReturnValue(enhancedResponse);

      const result = middleware(mockRequest);

      expect(mockAddCorsHeaders).toHaveBeenCalledWith(expect.any(NextResponse), mockRequest);
      expect(result).toBe(enhancedResponse);
    });

    it('should add CORS headers to PUT requests', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'PUT',
        headers: {
          origin: 'http://localhost:3001'
        }
      });

      const mockResponse = new NextResponse('test response');
      const enhancedResponse = new NextResponse('test response with CORS');
      mockAddCorsHeaders.mockReturnValue(enhancedResponse);

      const result = middleware(mockRequest);

      expect(mockAddCorsHeaders).toHaveBeenCalledWith(expect.any(NextResponse), mockRequest);
      expect(result).toBe(enhancedResponse);
    });

    it('should add CORS headers to DELETE requests', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'DELETE',
        headers: {
          origin: 'http://localhost:3001'
        }
      });

      const mockResponse = new NextResponse('test response');
      const enhancedResponse = new NextResponse('test response with CORS');
      mockAddCorsHeaders.mockReturnValue(enhancedResponse);

      const result = middleware(mockRequest);

      expect(mockAddCorsHeaders).toHaveBeenCalledWith(expect.any(NextResponse), mockRequest);
      expect(result).toBe(enhancedResponse);
    });
  });

  describe('request processing', () => {
    it('should process requests with different origins', () => {
      const origins = [
        'http://localhost:3001',
        'https://plataforma-pagos-daii-web-preprod.vercel.app',
        'https://plataforma-pagos-daii-web.vercel.app'
      ];

      origins.forEach(origin => {
        mockRequest = new NextRequest('http://localhost:3000/api/test', {
          method: 'GET',
          headers: { origin }
        });

        const mockResponse = new NextResponse('test response');
        const enhancedResponse = new NextResponse('test response with CORS');
        mockAddCorsHeaders.mockReturnValue(enhancedResponse);

        const result = middleware(mockRequest);

        expect(mockAddCorsHeaders).toHaveBeenCalledWith(expect.any(NextResponse), mockRequest);
        expect(result).toBe(enhancedResponse);
      });
    });

    it('should handle requests without origin header', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {}
      });

      const mockResponse = new NextResponse('test response');
      const enhancedResponse = new NextResponse('test response with CORS');
      mockAddCorsHeaders.mockReturnValue(enhancedResponse);

      const result = middleware(mockRequest);

      expect(mockAddCorsHeaders).toHaveBeenCalledWith(expect.any(NextResponse), mockRequest);
      expect(result).toBe(enhancedResponse);
    });
  });

  describe('edge cases', () => {
    it('should handle malformed URLs', () => {
      mockRequest = new NextRequest('invalid-url', {
        method: 'GET',
        headers: {
          origin: 'http://localhost:3001'
        }
      });

      const mockResponse = new NextResponse('test response');
      const enhancedResponse = new NextResponse('test response with CORS');
      mockAddCorsHeaders.mockReturnValue(enhancedResponse);

      const result = middleware(mockRequest);

      expect(mockAddCorsHeaders).toHaveBeenCalledWith(expect.any(NextResponse), mockRequest);
      expect(result).toBe(enhancedResponse);
    });

    it('should handle requests with special characters in headers', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          origin: 'http://localhost:3001',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'accept-language': 'en-US,en;q=0.9,es;q=0.8'
        }
      });

      const mockResponse = new NextResponse('test response');
      const enhancedResponse = new NextResponse('test response with CORS');
      mockAddCorsHeaders.mockReturnValue(enhancedResponse);

      const result = middleware(mockRequest);

      expect(mockAddCorsHeaders).toHaveBeenCalledWith(expect.any(NextResponse), mockRequest);
      expect(result).toBe(enhancedResponse);
    });
  });
});
