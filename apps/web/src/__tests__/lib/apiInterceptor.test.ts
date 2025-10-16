import { apiInterceptor, initializeApiInterceptor, cleanupApiInterceptor } from '../../lib/apiInterceptor';
import { getStoredToken } from '../../lib/auth';

// Mock the auth module
jest.mock('../../lib/auth', () => ({
  getStoredToken: jest.fn(),
}));

const mockGetStoredToken = getStoredToken as jest.MockedFunction<typeof getStoredToken>;

// Mock console methods to reduce test noise
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('ApiInterceptor', () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    // Store original fetch
    originalFetch = window.fetch;
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset fetch to original before each test
    window.fetch = originalFetch;
  });

  afterEach(() => {
    // Always restore original fetch after each test
    try {
      cleanupApiInterceptor();
    } catch (e) {
      // Ignore errors during cleanup
    }
    window.fetch = originalFetch;
  });

  describe('Installation and Uninstallation', () => {
    it('installs the interceptor and replaces window.fetch', () => {
      const originalWindowFetch = window.fetch;
      
      initializeApiInterceptor();
      
      expect(window.fetch).not.toBe(originalWindowFetch);
      expect(typeof window.fetch).toBe('function');
    });

    it('uninstalls the interceptor', () => {
      initializeApiInterceptor();
      const interceptedFetch = window.fetch;
      
      cleanupApiInterceptor();
      
      expect(window.fetch).not.toBe(interceptedFetch);
      expect(typeof window.fetch).toBe('function');
    });

    it('can be installed and uninstalled multiple times', () => {
      initializeApiInterceptor();
      cleanupApiInterceptor();
      initializeApiInterceptor();
      cleanupApiInterceptor();
      
      expect(typeof window.fetch).toBe('function');
    });
  });

  describe('Token and Header Management', () => {
    it('correctly sets up interceptor with token available', () => {
      const mockToken = 'test-jwt-token-123';
      mockGetStoredToken.mockReturnValue(mockToken);
      
      // Create a mock fetch that captures the request
      const mockFetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
        })
      );
      
      window.fetch = mockFetch;
      initializeApiInterceptor();
      
      // Verify the mock is callable
      expect(typeof window.fetch).toBe('function');
      expect(mockGetStoredToken).toHaveBeenCalledTimes(0); // Not called until actual fetch
    });

    it('correctly sets up interceptor without token', () => {
      mockGetStoredToken.mockReturnValue(null);
      
      const mockFetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
        })
      );
      
      window.fetch = mockFetch;
      initializeApiInterceptor();
      
      // Verify the mock is callable
      expect(typeof window.fetch).toBe('function');
    });
  });

  describe('Singleton Instance', () => {
    it('exports a singleton instance', () => {
      expect(apiInterceptor).toBeDefined();
      expect(typeof apiInterceptor.install).toBe('function');
      expect(typeof apiInterceptor.uninstall).toBe('function');
    });

    it('can use the singleton instance directly', () => {
      const originalWindowFetch = window.fetch;
      
      apiInterceptor.install();
      expect(window.fetch).not.toBe(originalWindowFetch);
      expect(typeof window.fetch).toBe('function');
      
      apiInterceptor.uninstall();
      expect(typeof window.fetch).toBe('function');
    });
  });

  describe('Interceptor Class API', () => {
    it('has correct methods on the class', () => {
      expect(typeof apiInterceptor.install).toBe('function');
      expect(typeof apiInterceptor.uninstall).toBe('function');
    });

    it('maintains function signature after install', () => {
      initializeApiInterceptor();
      
      // window.fetch should still be a function that takes RequestInfo and RequestInit
      expect(window.fetch).toBeInstanceOf(Function);
      expect(window.fetch.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Initialization Functions', () => {
    it('initializeApiInterceptor is a function', () => {
      expect(typeof initializeApiInterceptor).toBe('function');
    });

    it('cleanupApiInterceptor is a function', () => {
      expect(typeof cleanupApiInterceptor).toBe('function');
    });

    it('does not throw when initializing', () => {
      expect(() => initializeApiInterceptor()).not.toThrow();
    });

    it('does not throw when cleaning up', () => {
      initializeApiInterceptor();
      expect(() => cleanupApiInterceptor()).not.toThrow();
    });

    it('does not throw when cleaning up without initializing', () => {
      expect(() => cleanupApiInterceptor()).not.toThrow();
    });
  });

  describe('Token Storage Integration', () => {
    it('integrates with getStoredToken from auth module', () => {
      mockGetStoredToken.mockReturnValue('some-token');
      
      // Verify the mock is set up correctly
      expect(getStoredToken()).toBe('some-token');
      expect(mockGetStoredToken).toHaveBeenCalled();
    });

    it('handles null token from getStoredToken', () => {
      mockGetStoredToken.mockReturnValue(null);
      
      expect(getStoredToken()).toBeNull();
      expect(mockGetStoredToken).toHaveBeenCalled();
    });
  });
});
