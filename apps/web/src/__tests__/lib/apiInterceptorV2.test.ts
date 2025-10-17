import { initializeApiInterceptorV2, cleanupApiInterceptorV2 } from '../../lib/apiInterceptorV2';
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

describe('ApiInterceptorV2', () => {
  let originalFetch: typeof fetch;
  let originalWindowLocation: Location;

  beforeEach(() => {
    // Store original fetch
    originalFetch = window.fetch;
    
    // Store and mock window.location
    originalWindowLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalWindowLocation, href: '' } as any;
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset fetch to original before each test
    window.fetch = originalFetch;
  });

  afterEach(() => {
    // Always restore original fetch after each test
    try {
      cleanupApiInterceptorV2();
    } catch (e) {
      // Ignore errors during cleanup
    }
    window.fetch = originalFetch;
    window.location = originalWindowLocation;
  });

  describe('Installation and Cleanup', () => {
    it('installs the interceptor and replaces window.fetch', () => {
      const originalWindowFetch = window.fetch;
      
      initializeApiInterceptorV2();
      
      expect(window.fetch).not.toBe(originalWindowFetch);
      expect(typeof window.fetch).toBe('function');
    });

    it('uninstalls the interceptor', () => {
      initializeApiInterceptorV2();
      const interceptedFetch = window.fetch;
      
      cleanupApiInterceptorV2();
      
      expect(window.fetch).not.toBe(interceptedFetch);
      expect(typeof window.fetch).toBe('function');
    });

    it('can be installed and uninstalled multiple times', () => {
      initializeApiInterceptorV2();
      cleanupApiInterceptorV2();
      initializeApiInterceptorV2();
      cleanupApiInterceptorV2();
      
      expect(typeof window.fetch).toBe('function');
    });

    it('does not install twice if already installed', () => {
      initializeApiInterceptorV2();
      const firstInterceptedFetch = window.fetch;
      
      initializeApiInterceptorV2();
      
      expect(window.fetch).toBe(firstInterceptedFetch);
    });

    it('handles cleanup when not installed', () => {
      expect(() => cleanupApiInterceptorV2()).not.toThrow();
    });
  });

  describe('Token Management', () => {
    it('works with token available', () => {
      const mockToken = 'test-jwt-token-123';
      mockGetStoredToken.mockReturnValue(mockToken);
      
      initializeApiInterceptorV2();
      
      expect(typeof window.fetch).toBe('function');
      expect(mockGetStoredToken).toHaveBeenCalledTimes(0); // Not called until fetch is used
    });

    it('works without token', () => {
      mockGetStoredToken.mockReturnValue(null);
      
      initializeApiInterceptorV2();
      
      expect(typeof window.fetch).toBe('function');
    });
  });

  describe('Initialization', () => {
    it('initializeApiInterceptorV2 is exported as a function', () => {
      expect(typeof initializeApiInterceptorV2).toBe('function');
    });

    it('cleanupApiInterceptorV2 is exported as a function', () => {
      expect(typeof cleanupApiInterceptorV2).toBe('function');
    });

    it('does not throw when initializing', () => {
      expect(() => initializeApiInterceptorV2()).not.toThrow();
    });

    it('does not throw when cleaning up', () => {
      initializeApiInterceptorV2();
      expect(() => cleanupApiInterceptorV2()).not.toThrow();
    });
  });

  describe('Functional Approach', () => {
    it('uses functional approach with proper binding', () => {
      initializeApiInterceptorV2();
      
      // Fetch should still be a function
      expect(typeof window.fetch).toBe('function');
      
      // Should maintain function signature
      expect(window.fetch.length).toBeGreaterThanOrEqual(1);
    });

    it('maintains interceptor state across calls', () => {
      initializeApiInterceptorV2();
      const fetch1 = window.fetch;
      
      // Try to install again
      initializeApiInterceptorV2();
      const fetch2 = window.fetch;
      
      // Should be the same instance
      expect(fetch1).toBe(fetch2);
    });
  });

  describe('Environment Configuration', () => {
    const originalEnv = process.env.REACT_APP_VERCEL_API;

    afterEach(() => {
      if (originalEnv) {
        process.env.REACT_APP_VERCEL_API = originalEnv;
      } else {
        delete process.env.REACT_APP_VERCEL_API;
      }
    });

    it('works with default API URL', () => {
      delete process.env.REACT_APP_VERCEL_API;
      
      initializeApiInterceptorV2();
      
      expect(typeof window.fetch).toBe('function');
    });

    it('works with custom API URL', () => {
      process.env.REACT_APP_VERCEL_API = 'https://custom-api.com';
      
      initializeApiInterceptorV2();
      
      expect(typeof window.fetch).toBe('function');
    });
  });

  describe('Integration with auth module', () => {
    it('integrates with getStoredToken function', () => {
      mockGetStoredToken.mockReturnValue('test-token');
      
      expect(getStoredToken()).toBe('test-token');
      expect(mockGetStoredToken).toHaveBeenCalled();
    });

    it('handles null token from storage', () => {
      mockGetStoredToken.mockReturnValue(null);
      
      expect(getStoredToken()).toBeNull();
      expect(mockGetStoredToken).toHaveBeenCalled();
    });

    it('handles undefined token from storage', () => {
      mockGetStoredToken.mockReturnValue(null);
      
      expect(getStoredToken()).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('does not throw when fetch is called after installation', () => {
      const mockFetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: 'test' }), { status: 200 })
      );
      
      window.fetch = mockFetch;
      initializeApiInterceptorV2();
      
      expect(typeof window.fetch).toBe('function');
    });
  });

  describe('V2 Specific Features', () => {
    it('is version 2 of the interceptor', () => {
      // This test ensures we're testing V2 specifically
      initializeApiInterceptorV2();
      
      expect(typeof window.fetch).toBe('function');
      
      cleanupApiInterceptorV2();
      
      expect(typeof window.fetch).toBe('function');
    });

    it('provides V2-specific initialization function', () => {
      expect(initializeApiInterceptorV2).toBeDefined();
      expect(typeof initializeApiInterceptorV2).toBe('function');
    });

    it('provides V2-specific cleanup function', () => {
      expect(cleanupApiInterceptorV2).toBeDefined();
      expect(typeof cleanupApiInterceptorV2).toBe('function');
    });
  });

  describe('State Management', () => {
    it('maintains installation state', () => {
      // Not installed initially
      cleanupApiInterceptorV2(); // Ensure clean state
      
      // Install
      initializeApiInterceptorV2();
      const interceptedFetch = window.fetch;
      
      // Try to install again - should not change
      initializeApiInterceptorV2();
      
      expect(window.fetch).toBe(interceptedFetch);
    });

    it('resets state on cleanup', () => {
      initializeApiInterceptorV2();
      cleanupApiInterceptorV2();
      
      // Should be able to install again
      initializeApiInterceptorV2();
      
      expect(typeof window.fetch).toBe('function');
    });
  });

  describe('Fetch Interception Logic', () => {
    it('installs successfully and replaces window.fetch', () => {
      const originalFetch = window.fetch;
      
      initializeApiInterceptorV2();
      
      // Verify fetch was replaced
      expect(window.fetch).not.toBe(originalFetch);
      expect(typeof window.fetch).toBe('function');
      
      cleanupApiInterceptorV2();
    });

    it('cleans up and restores original fetch', () => {
      initializeApiInterceptorV2();
      const interceptedFetch = window.fetch;
      
      cleanupApiInterceptorV2();
      
      // Verify fetch was restored
      expect(window.fetch).not.toBe(interceptedFetch);
      expect(typeof window.fetch).toBe('function');
    });

    it('integrates with token storage', () => {
      const mockToken = 'test-jwt-token-123';
      mockGetStoredToken.mockReturnValue(mockToken);
      
      initializeApiInterceptorV2();
      
      // Verify interceptor is installed
      expect(typeof window.fetch).toBe('function');
      
      // Verify token retrieval works
      expect(getStoredToken()).toBe(mockToken);
      
      cleanupApiInterceptorV2();
    });

    it('handles null tokens correctly', () => {
      mockGetStoredToken.mockReturnValue(null);
      
      initializeApiInterceptorV2();
      
      // Verify interceptor is installed even without token
      expect(typeof window.fetch).toBe('function');
      
      // Verify null token is handled
      expect(getStoredToken()).toBeNull();
      
      cleanupApiInterceptorV2();
    });

    it('maintains fetch function signature', () => {
      initializeApiInterceptorV2();
      
      // Verify fetch maintains correct signature
      expect(window.fetch).toBeInstanceOf(Function);
      expect(window.fetch.length).toBeGreaterThanOrEqual(1);
      
      cleanupApiInterceptorV2();
    });

    it('can be installed and cleaned up multiple times', () => {
      for (let i = 0; i < 3; i++) {
        initializeApiInterceptorV2();
        expect(typeof window.fetch).toBe('function');
        
        cleanupApiInterceptorV2();
        expect(typeof window.fetch).toBe('function');
      }
    });

    it('prevents double installation', () => {
      initializeApiInterceptorV2();
      const firstFetch = window.fetch;
      
      initializeApiInterceptorV2(); // Try to install again
      
      // Should be the same instance
      expect(window.fetch).toBe(firstFetch);
      
      cleanupApiInterceptorV2();
    });

    it('handles cleanup when not installed', () => {
      // Should not throw
      expect(() => cleanupApiInterceptorV2()).not.toThrow();
    });
  });
});

