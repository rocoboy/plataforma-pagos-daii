import { 
  initializeApiInterceptorV2, 
  cleanupApiInterceptorV2 
} from '../../lib/apiInterceptorV2';
import { getStoredToken } from '../../lib/auth';

// Mock dependencies
jest.mock('../../lib/auth', () => ({
  getStoredToken: jest.fn()
}));

const mockGetStoredToken = getStoredToken as jest.MockedFunction<typeof getStoredToken>;

// Store original fetch and window properties
const originalFetch = window.fetch;
const originalLocation = window.location;
const originalDispatchEvent = window.dispatchEvent;

describe('API Interceptor V2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock window.location
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' };
    
    // Mock window.dispatchEvent
    window.dispatchEvent = jest.fn();
    
    // Reset fetch
    window.fetch = originalFetch;
  });

  afterEach(() => {
    // Cleanup
    cleanupApiInterceptorV2();
    
    // Restore mocks
    window.location = originalLocation;
    window.dispatchEvent = originalDispatchEvent;
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should install interceptor on first call', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      initializeApiInterceptorV2();
      
      expect(consoleSpy).toHaveBeenCalledWith('🚀 API Interceptor V2 installed - JWT tokens will be added automatically');
      expect(window.fetch).not.toBe(originalFetch);
    });

    it('should not install interceptor twice', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      initializeApiInterceptorV2();
      initializeApiInterceptorV2();
      
      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });

    it('should cleanup and restore original fetch', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      initializeApiInterceptorV2();
      cleanupApiInterceptorV2();
      
      expect(consoleSpy).toHaveBeenCalledWith('🔄 API Interceptor V2 uninstalled - restored original fetch');
      expect(window.fetch).toBe(originalFetch);
    });
  });

  describe('API Call Detection', () => {
    beforeEach(() => {
      initializeApiInterceptorV2();
    });

    it('should detect API calls to localhost', async () => {
      const mockFetch = jest.fn().mockResolvedValue(new Response('test'));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('http://localhost:3000/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        expect.objectContaining({
          headers: expect.any(Headers)
        })
      );
    });

    it('should detect relative API calls', async () => {
      const mockFetch = jest.fn().mockResolvedValue(new Response('test'));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.any(Headers)
        })
      );
    });

    it('should detect API calls with /api/ in URL', async () => {
      const mockFetch = jest.fn().mockResolvedValue(new Response('test'));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('https://example.com/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/api/test',
        expect.objectContaining({
          headers: expect.any(Headers)
        })
      );
    });

    it('should not intercept non-API calls', async () => {
      const mockFetch = jest.fn().mockResolvedValue(new Response('test'));
      window.fetch = mockFetch;

      await fetch('https://example.com/static/image.jpg');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/static/image.jpg',
        undefined
      );
    });
  });

  describe('Token Injection', () => {
    beforeEach(() => {
      initializeApiInterceptorV2();
    });

    it('should add Authorization header when token exists', async () => {
      const mockFetch = jest.fn().mockResolvedValue(new Response('test'));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('/api/test');

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1]?.headers as Headers;
      
      expect(headers.get('Authorization')).toBe('Bearer test-token');
    });

    it('should not add Authorization header when no token', async () => {
      const mockFetch = jest.fn().mockResolvedValue(new Response('test'));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue(null);

      await fetch('/api/test');

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1]?.headers as Headers;
      
      expect(headers.get('Authorization')).toBeNull();
    });

    it('should skip token injection for auth login endpoint', async () => {
      const mockFetch = jest.fn().mockResolvedValue(new Response('test'));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('/api/auth/login');

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1]?.headers as Headers;
      
      expect(headers.get('Authorization')).toBeNull();
    });

    it('should set Content-Type header for API calls', async () => {
      const mockFetch = jest.fn().mockResolvedValue(new Response('test'));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('/api/test');

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1]?.headers as Headers;
      
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('should preserve existing headers', async () => {
      const mockFetch = jest.fn().mockResolvedValue(new Response('test'));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('/api/test', {
        headers: {
          'Custom-Header': 'custom-value'
        }
      });

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1]?.headers as Headers;
      
      expect(headers.get('Custom-Header')).toBe('custom-value');
      expect(headers.get('Authorization')).toBe('Bearer test-token');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      initializeApiInterceptorV2();
    });

    it('should handle 403 responses and redirect to access denied', async () => {
      const mockFetch = jest.fn().mockResolvedValue(new Response('Forbidden', { status: 403 }));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('/api/test');

      expect(window.location.href).toBe('/access-denied');
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'accessDenied',
          detail: { message: 'Acceso denegado: No tienes permisos suficientes' }
        })
      );
    });

    it('should handle 401 responses and redirect to login', async () => {
      const mockFetch = jest.fn().mockResolvedValue(new Response('Unauthorized', { status: 401 }));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('/api/test');

      expect(window.location.href).toBe('/login');
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'unauthorized',
          detail: { message: 'No autorizado: Tu sesión ha expirado' }
        })
      );
    });

    it('should not redirect for auth login endpoint on 401/403', async () => {
      const mockFetch = jest.fn().mockResolvedValue(new Response('Unauthorized', { status: 401 }));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('/api/auth/login');

      expect(window.location.href).toBe('');
      expect(window.dispatchEvent).not.toHaveBeenCalled();
    });

    it('should handle fetch errors gracefully', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
      window.fetch = mockFetch;
      const consoleSpy = jest.spyOn(console, 'error');

      await expect(fetch('/api/test')).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith('API Request failed:', expect.any(Error));
    });
  });

  describe('Auth Login Endpoint Detection', () => {
    beforeEach(() => {
      initializeApiInterceptorV2();
    });

    it('should detect auth login endpoint with absolute URL', async () => {
      const mockFetch = jest.fn().mockResolvedValue(new Response('test'));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('http://localhost:3000/api/auth/login');

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1]?.headers as Headers;
      
      expect(headers.get('Authorization')).toBeNull();
    });

    it('should detect auth login endpoint with relative URL', async () => {
      const mockFetch = jest.fn().mockResolvedValue(new Response('test'));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('/api/auth/login');

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1]?.headers as Headers;
      
      expect(headers.get('Authorization')).toBeNull();
    });

    it('should detect auth login endpoint with ending path', async () => {
      const mockFetch = jest.fn().mockResolvedValue(new Response('test'));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('https://example.com/api/auth/login');

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1]?.headers as Headers;
      
      expect(headers.get('Authorization')).toBeNull();
    });

    it('should handle malformed URLs gracefully', async () => {
      const mockFetch = jest.fn().mockResolvedValue(new Response('test'));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('invalid-url/api/auth/login');

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1]?.headers as Headers;
      
      expect(headers.get('Authorization')).toBeNull();
    });
  });

  describe('Environment Configuration', () => {
    it('should use REACT_APP_VERCEL_API when set', async () => {
      const originalEnv = process.env.REACT_APP_VERCEL_API;
      process.env.REACT_APP_VERCEL_API = 'https://custom-api.com';
      
      initializeApiInterceptorV2();
      
      const mockFetch = jest.fn().mockResolvedValue(new Response('test'));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('https://custom-api.com/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://custom-api.com/api/test',
        expect.objectContaining({
          headers: expect.any(Headers)
        })
      );

      process.env.REACT_APP_VERCEL_API = originalEnv;
    });

    it('should use default localhost when REACT_APP_VERCEL_API not set', async () => {
      const originalEnv = process.env.REACT_APP_VERCEL_API;
      delete process.env.REACT_APP_VERCEL_API;
      
      initializeApiInterceptorV2();
      
      const mockFetch = jest.fn().mockResolvedValue(new Response('test'));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('http://localhost:3000/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        expect.objectContaining({
          headers: expect.any(Headers)
        })
      );

      process.env.REACT_APP_VERCEL_API = originalEnv;
    });
  });

  describe('Logging', () => {
    beforeEach(() => {
      initializeApiInterceptorV2();
    });

    it('should log API call interception', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const mockFetch = jest.fn().mockResolvedValue(new Response('test'));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('/api/test');

      expect(consoleSpy).toHaveBeenCalledWith('🔗 Intercepting API call:', '/api/test');
      expect(consoleSpy).toHaveBeenCalledWith('🎫 Token from storage:', expect.stringContaining('test-token'));
      expect(consoleSpy).toHaveBeenCalledWith('🔐 JWT token added to request headers');
    });

    it('should log when no token is found', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const mockFetch = jest.fn().mockResolvedValue(new Response('test'));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue(null);

      await fetch('/api/test');

      expect(consoleSpy).toHaveBeenCalledWith('⚠️ No JWT token found in localStorage');
    });

    it('should log API response details', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const mockFetch = jest.fn().mockResolvedValue(new Response('test', { status: 200, statusText: 'OK' }));
      window.fetch = mockFetch;
      mockGetStoredToken.mockReturnValue('test-token');

      await fetch('/api/test');

      expect(consoleSpy).toHaveBeenCalledWith('API Response:', {
        url: '/api/test',
        status: 200,
        statusText: 'OK',
        hasAuthHeader: true
      });
    });
  });
});
