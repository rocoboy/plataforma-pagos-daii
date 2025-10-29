import { NextRequest } from 'next/server';
import { adminAuthMiddleware } from '../../app/api/middleware/adminAuth';
import { createCorsResponse } from '../../lib/cors';
import * as jwt from 'jsonwebtoken';

// Mock the cors module
jest.mock('../../lib/cors', () => ({
  createCorsResponse: jest.fn((request, data, status = 200) => ({
    json: () => data,
    status,
    headers: new Headers()
  }))
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  decode: jest.fn()
}));

const mockCreateCorsResponse = createCorsResponse as jest.MockedFunction<typeof createCorsResponse>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('adminAuthMiddleware', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    
    // Mock console.log to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when authorization header is missing', () => {
    it('should return 401 error for missing auth header', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {}
      });

      const result = adminAuthMiddleware(mockRequest);

      expect(mockCreateCorsResponse).toHaveBeenCalledWith(
        mockRequest,
        { error: 'Token requerido' },
        401
      );
      expect(result).toBeDefined();
    });

    it('should return 401 error for auth header without Bearer prefix', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          authorization: 'InvalidToken'
        }
      });

      const result = adminAuthMiddleware(mockRequest);

      expect(mockCreateCorsResponse).toHaveBeenCalledWith(
        mockRequest,
        { error: 'Token requerido' },
        401
      );
      expect(result).toBeDefined();
    });
  });

  describe('when authorization header is present', () => {
    beforeEach(() => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token'
        }
      });
    });

    it('should return 401 error for invalid JWT token', () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = adminAuthMiddleware(mockRequest);

      expect(mockCreateCorsResponse).toHaveBeenCalledWith(
        mockRequest,
        { error: 'Token inválido o expirado' },
        401
      );
      expect(result).toBeDefined();
    });

    it('should return 403 error for non-admin role', () => {
      mockJwt.verify.mockReturnValue({ rol: 'user' } as jwt.JwtPayload);

      const result = adminAuthMiddleware(mockRequest);

      expect(mockCreateCorsResponse).toHaveBeenCalledWith(
        mockRequest,
        { error: 'Acceso denegado: rol insuficiente' },
        403
      );
      expect(result).toBeDefined();
    });

    it('should return null for valid admin token', () => {
      mockJwt.verify.mockReturnValue({ rol: 'admin' } as jwt.JwtPayload);

      const result = adminAuthMiddleware(mockRequest);

      expect(result).toBeNull();
      expect(mockCreateCorsResponse).not.toHaveBeenCalled();
    });

    it('should handle JWT verification errors gracefully', () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      const result = adminAuthMiddleware(mockRequest);

      expect(mockCreateCorsResponse).toHaveBeenCalledWith(
        mockRequest,
        { error: 'Token inválido o expirado' },
        401
      );
      expect(result).toBeDefined();
    });

    it('should handle missing JWT_SECRET environment variable', () => {
      delete process.env.JWT_SECRET;
      
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Secret not defined');
      });

      const result = adminAuthMiddleware(mockRequest);

      expect(mockCreateCorsResponse).toHaveBeenCalledWith(
        mockRequest,
        { error: 'Token inválido o expirado' },
        401
      );
      expect(result).toBeDefined();
    });
  });

  describe('token extraction and validation', () => {
    it('should extract token correctly from Bearer header', () => {
      mockJwt.verify.mockReturnValue({ rol: 'admin' } as jwt.JwtPayload);

      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature'
        }
      });

      adminAuthMiddleware(mockRequest);

      expect(mockJwt.verify).toHaveBeenCalledWith(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature',
        'test-secret'
      );
    });

    it('should handle malformed authorization header', () => {
      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          authorization: 'Bearer'
        }
      });

      const result = adminAuthMiddleware(mockRequest);

      expect(mockCreateCorsResponse).toHaveBeenCalledWith(
        mockRequest,
        { error: 'Token inválido o expirado' },
        401
      );
      expect(result).toBeDefined();
    });
  });

  describe('logging behavior', () => {
    it('should log appropriate messages during token validation', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockJwt.verify.mockReturnValue({ rol: 'admin' } as jwt.JwtPayload);

      mockRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
        headers: {
          authorization: 'Bearer test-token'
        }
      });

      adminAuthMiddleware(mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith('Admin auth middleware called');
      expect(consoleSpy).toHaveBeenCalledWith('Auth header:', expect.stringContaining('Bearer'));
    });
  });
});
