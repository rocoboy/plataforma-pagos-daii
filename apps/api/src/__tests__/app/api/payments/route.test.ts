import { NextRequest } from 'next/server';
import { GET, OPTIONS } from '../../app/api/payments/route';
import { adminAuthMiddleware } from '../../app/api/middleware/adminAuth';
import { createCorsResponse, createCorsOptionsResponse } from '../../lib/cors';
import { getAllPayments } from '../../app/api/payments/get-all-payments';

// Mock dependencies
jest.mock('../../app/api/middleware/adminAuth');
jest.mock('../../lib/cors');
jest.mock('../../app/api/payments/get-all-payments');

const mockAdminAuthMiddleware = adminAuthMiddleware as jest.MockedFunction<typeof adminAuthMiddleware>;
const mockCreateCorsResponse = createCorsResponse as jest.MockedFunction<typeof createCorsResponse>;
const mockCreateCorsOptionsResponse = createCorsOptionsResponse as jest.MockedFunction<typeof createCorsOptionsResponse>;
const mockGetAllPayments = getAllPayments as jest.MockedFunction<typeof getAllPayments>;

describe('/api/payments route', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = new NextRequest('http://localhost:3000/api/payments', {
      method: 'GET',
      headers: {
        origin: 'http://localhost:3001',
        authorization: 'Bearer valid-token'
      }
    });
  });

  describe('GET handler', () => {
    it('should return 401 when admin auth fails', async () => {
      const authError = new Response('Unauthorized', { status: 401 });
      mockAdminAuthMiddleware.mockReturnValue(authError);

      const result = await GET(mockRequest);

      expect(mockAdminAuthMiddleware).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(authError);
      expect(mockGetAllPayments).not.toHaveBeenCalled();
    });

    it('should return payments when admin auth succeeds', async () => {
      mockAdminAuthMiddleware.mockReturnValue(null);
      const mockPayments = [
        { id: '1', amount: 100, status: 'success' },
        { id: '2', amount: 200, status: 'pending' }
      ];
      mockGetAllPayments.mockResolvedValue(mockPayments);
      
      const mockResponse = new Response(JSON.stringify({ success: true, payments: mockPayments }), { status: 200 });
      mockCreateCorsResponse.mockReturnValue(mockResponse);

      const result = await GET(mockRequest);

      expect(mockAdminAuthMiddleware).toHaveBeenCalledWith(mockRequest);
      expect(mockGetAllPayments).toHaveBeenCalledWith(mockRequest);
      expect(mockCreateCorsResponse).toHaveBeenCalledWith(
        mockRequest,
        { success: true, payments: mockPayments }
      );
      expect(result).toBe(mockResponse);
    });

    it('should handle errors from getAllPayments', async () => {
      mockAdminAuthMiddleware.mockReturnValue(null);
      const error = new Error('Database connection failed');
      mockGetAllPayments.mockRejectedValue(error);
      
      const mockResponse = new Response(JSON.stringify({ 
        success: false, 
        error: 'Database connection failed' 
      }), { status: 500 });
      mockCreateCorsResponse.mockReturnValue(mockResponse);

      const result = await GET(mockRequest);

      expect(mockAdminAuthMiddleware).toHaveBeenCalledWith(mockRequest);
      expect(mockGetAllPayments).toHaveBeenCalledWith(mockRequest);
      expect(mockCreateCorsResponse).toHaveBeenCalledWith(
        mockRequest,
        { success: false, error: 'Database connection failed' },
        500
      );
      expect(result).toBe(mockResponse);
    });

    it('should handle non-Error exceptions', async () => {
      mockAdminAuthMiddleware.mockReturnValue(null);
      mockGetAllPayments.mockRejectedValue('String error');
      
      const mockResponse = new Response(JSON.stringify({ 
        success: false, 
        error: 'Unknown error' 
      }), { status: 500 });
      mockCreateCorsResponse.mockReturnValue(mockResponse);

      const result = await GET(mockRequest);

      expect(mockCreateCorsResponse).toHaveBeenCalledWith(
        mockRequest,
        { success: false, error: 'Unknown error' },
        500
      );
      expect(result).toBe(mockResponse);
    });

    it('should handle null/undefined errors', async () => {
      mockAdminAuthMiddleware.mockReturnValue(null);
      mockGetAllPayments.mockRejectedValue(null);
      
      const mockResponse = new Response(JSON.stringify({ 
        success: false, 
        error: 'Unknown error' 
      }), { status: 500 });
      mockCreateCorsResponse.mockReturnValue(mockResponse);

      const result = await GET(mockRequest);

      expect(mockCreateCorsResponse).toHaveBeenCalledWith(
        mockRequest,
        { success: false, error: 'Unknown error' },
        500
      );
      expect(result).toBe(mockResponse);
    });
  });

  describe('OPTIONS handler', () => {
    it('should return CORS preflight response', async () => {
      const mockResponse = new Response(null, { status: 204 });
      mockCreateCorsOptionsResponse.mockReturnValue(mockResponse);

      const result = await OPTIONS(mockRequest);

      expect(mockCreateCorsOptionsResponse).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(mockResponse);
    });

    it('should handle different request origins', async () => {
      const origins = [
        'http://localhost:3001',
        'https://plataforma-pagos-daii-web-preprod.vercel.app',
        'https://plataforma-pagos-daii-web.vercel.app'
      ];

      for (const origin of origins) {
        const request = new NextRequest('http://localhost:3000/api/payments', {
          method: 'OPTIONS',
          headers: { origin }
        });

        const mockResponse = new Response(null, { status: 204 });
        mockCreateCorsOptionsResponse.mockReturnValue(mockResponse);

        const result = await OPTIONS(request);

        expect(mockCreateCorsOptionsResponse).toHaveBeenCalledWith(request);
        expect(result).toBe(mockResponse);
      }
    });
  });

  describe('request validation', () => {
    it('should handle requests with different HTTP methods', async () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      
      for (const method of methods) {
        const request = new NextRequest('http://localhost:3000/api/payments', {
          method: method as any,
          headers: {
            origin: 'http://localhost:3001',
            authorization: 'Bearer valid-token'
          }
        });

        if (method === 'GET') {
          mockAdminAuthMiddleware.mockReturnValue(null);
          mockGetAllPayments.mockResolvedValue([]);
          mockCreateCorsResponse.mockReturnValue(new Response());
          
          await GET(request);
          expect(mockAdminAuthMiddleware).toHaveBeenCalledWith(request);
        } else if (method === 'OPTIONS') {
          mockCreateCorsOptionsResponse.mockReturnValue(new Response());
          await OPTIONS(request);
          expect(mockCreateCorsOptionsResponse).toHaveBeenCalledWith(request);
        }
      }
    });

    it('should handle requests without authorization header', async () => {
      const request = new NextRequest('http://localhost:3000/api/payments', {
        method: 'GET',
        headers: {
          origin: 'http://localhost:3001'
        }
      });

      const authError = new Response('Unauthorized', { status: 401 });
      mockAdminAuthMiddleware.mockReturnValue(authError);

      const result = await GET(request);

      expect(mockAdminAuthMiddleware).toHaveBeenCalledWith(request);
      expect(result).toBe(authError);
    });
  });
});
