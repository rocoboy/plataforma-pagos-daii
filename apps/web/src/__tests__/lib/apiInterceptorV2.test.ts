import { setupApiInterceptorV2 } from '../apiInterceptorV2';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error');
const mockConsoleWarn = jest.spyOn(console, 'warn');

describe('API Interceptor V2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
  });

  describe('setupApiInterceptorV2', () => {
    it('should be defined and callable', () => {
      expect(setupApiInterceptorV2).toBeDefined();
      expect(typeof setupApiInterceptorV2).toBe('function');
    });

    it('should call setupApiInterceptorV2 without errors', () => {
      expect(() => setupApiInterceptorV2()).not.toThrow();
    });
  });

  describe('Token Management', () => {
    it('should get token from localStorage', () => {
      const mockToken = 'test-jwt-token-v2';
      mockLocalStorage.getItem.mockReturnValue(mockToken);

      setupApiInterceptorV2();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('token');
    });

    it('should handle missing token gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      expect(() => setupApiInterceptorV2()).not.toThrow();
    });

    it('should handle empty token', () => {
      mockLocalStorage.getItem.mockReturnValue('');

      expect(() => setupApiInterceptorV2()).not.toThrow();
    });

    it('should handle undefined token', () => {
      mockLocalStorage.getItem.mockReturnValue(undefined);

      expect(() => setupApiInterceptorV2()).not.toThrow();
    });
  });

  describe('Fetch Interception', () => {
    it('should intercept fetch calls', () => {
      const originalFetch = global.fetch;
      setupApiInterceptorV2();

      expect(global.fetch).not.toBe(originalFetch);
    });

    it('should preserve original fetch for non-API calls', async () => {
      const mockResponse = new Response('test', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptorV2();

      const response = await fetch('https://example.com/api/test');
      expect(mockFetch).toHaveBeenCalled();
      expect(response).toBe(mockResponse);
    });

    it('should add authorization header for API calls', async () => {
      const mockToken = 'test-jwt-token-v2';
      const mockResponse = new Response('success', { status: 200 });
      
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptorV2();

      await fetch('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
    });

    it('should handle requests without options', async () => {
      const mockToken = 'test-jwt-token-v2';
      const mockResponse = new Response('success', { status: 200 });
      
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptorV2();

      await fetch('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      );
    });

    it('should merge with existing headers', async () => {
      const mockToken = 'test-jwt-token-v2';
      const mockResponse = new Response('success', { status: 200 });
      
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptorV2();

      await fetch('/api/test', {
        headers: {
          'Content-Type': 'application/json',
          'Custom-Header': 'value'
        }
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
            'Custom-Header': 'value'
          })
        })
      );
    });

    it('should handle headers as Headers object', async () => {
      const mockToken = 'test-jwt-token-v2';
      const mockResponse = new Response('success', { status: 200 });
      
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptorV2();

      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      headers.set('Custom-Header', 'value');

      await fetch('/api/test', { headers });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
            'Custom-Header': 'value'
          })
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockFetch.mockRejectedValue(mockError);

      setupApiInterceptorV2();

      await expect(fetch('/api/test')).rejects.toThrow('Network error');
    });

    it('should handle localStorage errors', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(() => setupApiInterceptorV2()).not.toThrow();
    });

    it('should handle malformed URLs', async () => {
      const mockResponse = new Response('success', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptorV2();

      // Test with relative URL
      await fetch('/api/test');
      expect(mockFetch).toHaveBeenCalled();

      // Test with absolute URL
      await fetch('https://api.example.com/test');
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle invalid headers gracefully', async () => {
      const mockToken = 'test-jwt-token-v2';
      const mockResponse = new Response('success', { status: 200 });
      
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptorV2();

      // Test with invalid headers object
      await fetch('/api/test', {
        // @ts-ignore
        headers: 'invalid-headers'
      });

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('URL Matching', () => {
    beforeEach(() => {
      const mockResponse = new Response('success', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
    });

    it('should match API paths starting with /api/', async () => {
      const mockToken = 'test-jwt-token-v2';
      mockLocalStorage.getItem.mockReturnValue(mockToken);

      setupApiInterceptorV2();

      await fetch('/api/payments');
      await fetch('/api/users');
      await fetch('/api/auth/login');

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should not match non-API paths', async () => {
      const mockToken = 'test-jwt-token-v2';
      mockLocalStorage.getItem.mockReturnValue(mockToken);

      setupApiInterceptorV2();

      await fetch('/static/image.png');
      await fetch('/public/script.js');
      await fetch('https://external-api.com/data');

      // Should still call fetch but without authorization header
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should handle edge cases in URL matching', async () => {
      const mockToken = 'test-jwt-token-v2';
      mockLocalStorage.getItem.mockReturnValue(mockToken);

      setupApiInterceptorV2();

      // Test various URL formats
      await fetch('/api');
      await fetch('/api/');
      await fetch('/api/v1/test');
      await fetch('/api/test?param=value');
      await fetch('/api/test#fragment');

      expect(mockFetch).toHaveBeenCalledTimes(5);
    });

    it('should handle case sensitivity in URL matching', async () => {
      const mockToken = 'test-jwt-token-v2';
      mockLocalStorage.getItem.mockReturnValue(mockToken);

      setupApiInterceptorV2();

      await fetch('/API/test');
      await fetch('/Api/test');
      await fetch('/api/TEST');

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Token Refresh Scenarios', () => {
    it('should use updated token on subsequent calls', async () => {
      let tokenCallCount = 0;
      mockLocalStorage.getItem.mockImplementation(() => {
        tokenCallCount++;
        return tokenCallCount === 1 ? 'old-token-v2' : 'new-token-v2';
      });

      const mockResponse = new Response('success', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptorV2();

      // First call with old token
      await fetch('/api/test1');
      
      // Second call with new token
      await fetch('/api/test2');

      expect(mockFetch).toHaveBeenNthCalledWith(1, '/api/test1', expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer old-token-v2'
        })
      }));

      expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/test2', expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer new-token-v2'
        })
      }));
    });

    it('should handle token expiration gracefully', async () => {
      const mockToken = 'expired-token-v2';
      const mockResponse = new Response('Unauthorized', { status: 401 });
      
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptorV2();

      const response = await fetch('/api/test');
      expect(response.status).toBe(401);
    });
  });

  describe('Performance', () => {
    it('should not significantly impact performance', async () => {
      const mockResponse = new Response('success', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      mockLocalStorage.getItem.mockReturnValue('test-token-v2');

      setupApiInterceptorV2();

      const startTime = performance.now();
      
      // Make multiple rapid calls
      const promises = Array.from({ length: 100 }, (_, i) => 
        fetch(`/api/test${i}`)
      );
      
      await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete quickly (less than 100ms for 100 calls)
      expect(duration).toBeLessThan(100);
      expect(mockFetch).toHaveBeenCalledTimes(100);
    });

    it('should handle concurrent requests efficiently', async () => {
      const mockResponse = new Response('success', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      mockLocalStorage.getItem.mockReturnValue('test-token-v2');

      setupApiInterceptorV2();

      const startTime = performance.now();
      
      // Make 50 concurrent requests
      const promises = Array.from({ length: 50 }, (_, i) => 
        fetch(`/api/concurrent-test${i}`)
      );
      
      await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50); // Should be very fast
      expect(mockFetch).toHaveBeenCalledTimes(50);
    });
  });

  describe('Memory Management', () => {
    it('should not create memory leaks', () => {
      const initialMemory = process.memoryUsage();
      
      // Call setup multiple times
      for (let i = 0; i < 1000; i++) {
        setupApiInterceptorV2();
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB
    });

    it('should handle garbage collection properly', () => {
      // Create and destroy multiple interceptors
      for (let i = 0; i < 100; i++) {
        setupApiInterceptorV2();
        // Simulate garbage collection
        if (global.gc) {
          global.gc();
        }
      }

      // Should not throw errors
      expect(() => setupApiInterceptorV2()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined fetch', () => {
      const originalFetch = global.fetch;
      // @ts-ignore
      global.fetch = undefined;

      expect(() => setupApiInterceptorV2()).not.toThrow();

      // Restore
      global.fetch = originalFetch;
    });

    it('should handle null fetch', () => {
      const originalFetch = global.fetch;
      // @ts-ignore
      global.fetch = null;

      expect(() => setupApiInterceptorV2()).not.toThrow();

      // Restore
      global.fetch = originalFetch;
    });

    it('should handle malformed token', async () => {
      mockLocalStorage.getItem.mockReturnValue('malformed-token-v2');
      const mockResponse = new Response('success', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptorV2();

      await fetch('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer malformed-token-v2'
          })
        })
      );
    });

    it('should handle very long tokens', async () => {
      const longToken = 'a'.repeat(10000);
      mockLocalStorage.getItem.mockReturnValue(longToken);
      const mockResponse = new Response('success', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptorV2();

      await fetch('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${longToken}`
          })
        })
      );
    });

    it('should handle special characters in token', async () => {
      const specialToken = 'token-with-special-chars!@#$%^&*()';
      mockLocalStorage.getItem.mockReturnValue(specialToken);
      const mockResponse = new Response('success', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptorV2();

      await fetch('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${specialToken}`
          })
        })
      );
    });
  });

  describe('Integration Tests', () => {
    it('should work with different HTTP methods', async () => {
      const mockToken = 'test-jwt-token-v2';
      const mockResponse = new Response('success', { status: 200 });
      
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptorV2();

      // Test different HTTP methods
      await fetch('/api/test', { method: 'GET' });
      await fetch('/api/test', { method: 'POST' });
      await fetch('/api/test', { method: 'PUT' });
      await fetch('/api/test', { method: 'DELETE' });
      await fetch('/api/test', { method: 'PATCH' });

      expect(mockFetch).toHaveBeenCalledTimes(5);
    });

    it('should work with different content types', async () => {
      const mockToken = 'test-jwt-token-v2';
      const mockResponse = new Response('success', { status: 200 });
      
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptorV2();

      // Test different content types
      await fetch('/api/test', {
        headers: { 'Content-Type': 'application/json' }
      });
      await fetch('/api/test', {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      await fetch('/api/test', {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});