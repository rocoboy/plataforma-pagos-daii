// Fetch interceptor for automatic JWT token injection
import { getStoredToken } from './auth';

/**
 * Enhanced fetch function with automatic JWT token injection
 * This implements the interceptor pattern for API calls
 */
class ApiInterceptor {
  private originalFetch: typeof fetch;

  constructor() {
    // Properly bind the original fetch to maintain context
    this.originalFetch = window.fetch.bind(window);
  }

  /**
   * Install the fetch interceptor globally
   * This replaces the native fetch with our enhanced version
   */
  install(): void {
    // Create a bound version of our intercepted fetch
    const boundInterceptedFetch = this.interceptedFetch.bind(this);
    window.fetch = boundInterceptedFetch;
    console.log('🚀 API Interceptor installed - JWT tokens will be added automatically');
  }

  /**
   * Restore the original fetch function
   */
  uninstall(): void {
    window.fetch = this.originalFetch;
    console.log('🔄 API Interceptor uninstalled - restored original fetch');
  }

  /**
   * Intercepted fetch function that automatically adds JWT tokens
   */
  private async interceptedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    // Create a copy of the init object to avoid mutating the original
    const enhancedInit: RequestInit = { ...init };

    // Initialize headers if they don't exist
    enhancedInit.headers = new Headers(enhancedInit.headers || {});

    // Check if this is an API call to our backend
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const isApiCall = this.isApiCall(url);

    if (isApiCall) {
      console.log('🔗 Intercepting API call:', url);

      // Read token from localStorage
      const token = getStoredToken();
      
      if (token) {
        // Add Authorization header with Bearer token format
        enhancedInit.headers.set('Authorization', `Bearer ${token}`);
        console.log('🔐 JWT token added to request headers');
      } else {
        console.log('⚠️ No JWT token found in localStorage');
      }

      // Ensure Content-Type is set for API calls
      if (!enhancedInit.headers.has('Content-Type')) {
        enhancedInit.headers.set('Content-Type', 'application/json');
      }
    }

    // Call the original fetch with enhanced headers using proper context
    try {
      const response = await this.originalFetch(input, enhancedInit);
      
      // Log response for debugging
      if (isApiCall) {
        console.log('📡 API Response:', {
          url,
          status: response.status,
          statusText: response.statusText,
          hasAuthHeader: enhancedInit.headers.has('Authorization')
        });
      }

      return response;
    } catch (error) {
      if (isApiCall) {
        console.error('❌ API Request failed:', error);
      }
      throw error;
    }
  }

  /**
   * Determine if a URL is an API call to our backend
   */
  private isApiCall(url: string): boolean {
    const apiUrl = process.env.REACT_APP_VERCEL_API || 'http://localhost:3000';
    
    // Check if the URL starts with our API base URL or is a relative API path
    return url.startsWith(apiUrl) || 
           url.startsWith('/api/') || 
           url.includes('/api/');
  }
}

// Create and export a singleton instance
export const apiInterceptor = new ApiInterceptor();

/**
 * Initialize the API interceptor
 * Call this function early in your application startup
 */
export const initializeApiInterceptor = (): void => {
  apiInterceptor.install();
};

/**
 * Clean up the API interceptor
 * Call this if you need to restore original fetch behavior
 */
export const cleanupApiInterceptor = (): void => {
  apiInterceptor.uninstall();
};