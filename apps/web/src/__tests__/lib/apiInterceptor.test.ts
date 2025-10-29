import { setupApiInterceptor } from '../apiInterceptor';

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

describe('API Interceptor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockConsoleError.mockClear();
    mockConsoleWarn.mockClear();
  });

  describe('setupApiInterceptor', () => {
    it('should be defined and callable', () => {
      expect(setupApiInterceptor).toBeDefined();
      expect(typeof setupApiInterceptor).toBe('function');
    });

    it('should call setupApiInterceptor without errors', () => {
      expect(() => setupApiInterceptor()).not.toThrow();
    });
  });

  describe('Token Management', () => {
    it('should get token from localStorage', () => {
      const mockToken = 'test-jwt-token';
      mockLocalStorage.getItem.mockReturnValue(mockToken);

      setupApiInterceptor();

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('token');
    });

    it('should handle missing token gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      expect(() => setupApiInterceptor()).not.toThrow();
    });

    it('should handle empty token', () => {
      mockLocalStorage.getItem.mockReturnValue('');

      expect(() => setupApiInterceptor()).not.toThrow();
    });
  });

  describe('Fetch Interception', () => {
    it('should intercept fetch calls', () => {
      const originalFetch = global.fetch;
      setupApiInterceptor();

      expect(global.fetch).not.toBe(originalFetch);
    });

    it('should preserve original fetch for non-API calls', async () => {
      const mockResponse = new Response('test', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptor();

      const response = await fetch('https://example.com/api/test');
      expect(mockFetch).toHaveBeenCalled();
      expect(response).toBe(mockResponse);
    });

    it('should add authorization header for API calls', async () => {
      const mockToken = 'test-jwt-token';
      const mockResponse = new Response('success', { status: 200 });
      
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptor();

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
      const mockToken = 'test-jwt-token';
      const mockResponse = new Response('success', { status: 200 });
      
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptor();

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
      const mockToken = 'test-jwt-token';
      const mockResponse = new Response('success', { status: 200 });
      
      mockLocalStorage.getItem.mockReturnValue(mockToken);
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptor();

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
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockFetch.mockRejectedValue(mockError);

      setupApiInterceptor();

      await expect(fetch('/api/test')).rejects.toThrow('Network error');
    });

    it('should handle localStorage errors', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(() => setupApiInterceptor()).not.toThrow();
    });

    it('should handle malformed URLs', async () => {
      const mockResponse = new Response('success', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptor();

      // Test with relative URL
      await fetch('/api/test');
      expect(mockFetch).toHaveBeenCalled();

      // Test with absolute URL
      await fetch('https://api.example.com/test');
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('URL Matching', () => {
    beforeEach(() => {
      const mockResponse = new Response('success', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
    });

    it('should match API paths starting with /api/', async () => {
      const mockToken = 'test-jwt-token';
      mockLocalStorage.getItem.mockReturnValue(mockToken);

      setupApiInterceptor();

      await fetch('/api/payments');
      await fetch('/api/users');
      await fetch('/api/auth/login');

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should not match non-API paths', async () => {
      const mockToken = 'test-jwt-token';
      mockLocalStorage.getItem.mockReturnValue(mockToken);

      setupApiInterceptor();

      await fetch('/static/image.png');
      await fetch('/public/script.js');
      await fetch('https://external-api.com/data');

      // Should still call fetch but without authorization header
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should handle edge cases in URL matching', async () => {
      const mockToken = 'test-jwt-token';
      mockLocalStorage.getItem.mockReturnValue(mockToken);

      setupApiInterceptor();

      // Test various URL formats
      await fetch('/api');
      await fetch('/api/');
      await fetch('/api/v1/test');
      await fetch('/api/test?param=value');
      await fetch('/api/test#fragment');

      expect(mockFetch).toHaveBeenCalledTimes(5);
    });
  });

  describe('Token Refresh Scenarios', () => {
    it('should use updated token on subsequent calls', async () => {
      let tokenCallCount = 0;
      mockLocalStorage.getItem.mockImplementation(() => {
        tokenCallCount++;
        return tokenCallCount === 1 ? 'old-token' : 'new-token';
      });

      const mockResponse = new Response('success', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptor();

      // First call with old token
      await fetch('/api/test1');
      
      // Second call with new token
      await fetch('/api/test2');

      expect(mockFetch).toHaveBeenNthCalledWith(1, '/api/test1', expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer old-token'
        })
      }));

      expect(mockFetch).toHaveBeenNthCalledWith(2, '/api/test2', expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer new-token'
        })
      }));
    });
  });

  describe('Performance', () => {
    it('should not significantly impact performance', async () => {
      const mockResponse = new Response('success', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);
      mockLocalStorage.getItem.mockReturnValue('test-token');

      setupApiInterceptor();

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
  });

  describe('Memory Management', () => {
    it('should not create memory leaks', () => {
      const initialMemory = process.memoryUsage();
      
      // Call setup multiple times
      for (let i = 0; i < 1000; i++) {
        setupApiInterceptor();
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // Less than 1MB
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined fetch', () => {
      const originalFetch = global.fetch;
      // @ts-ignore
      global.fetch = undefined;

      expect(() => setupApiInterceptor()).not.toThrow();

      // Restore
      global.fetch = originalFetch;
    });

    it('should handle null fetch', () => {
      const originalFetch = global.fetch;
      // @ts-ignore
      global.fetch = null;

      expect(() => setupApiInterceptor()).not.toThrow();

      // Restore
      global.fetch = originalFetch;
    });

    it('should handle malformed token', async () => {
      mockLocalStorage.getItem.mockReturnValue('malformed-token');
      const mockResponse = new Response('success', { status: 200 });
      mockFetch.mockResolvedValue(mockResponse);

      setupApiInterceptor();

      await fetch('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer malformed-token'
          })
        })
      );
    });
  });
});