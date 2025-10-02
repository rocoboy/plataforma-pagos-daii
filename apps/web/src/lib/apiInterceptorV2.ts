// Alternative fetch interceptor implementation using functional approach
import { getStoredToken } from './auth';

// Store the original fetch function with proper binding
const originalFetch = window.fetch.bind(window);

/**
 * Enhanced fetch function with automatic JWT token injection
 */
const interceptedFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  // Create a copy of the init object to avoid mutating the original
  const enhancedInit: RequestInit = { ...init };

  // Initialize headers if they don't exist
  enhancedInit.headers = new Headers(enhancedInit.headers || {});

  // Check if this is an API call to our backend
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const isApiCall = isApiCallToBackend(url);

  if (isApiCall) {
    console.log('🔗 Intercepting API call:', url);

    // Read token from localStorage
    const token = getStoredToken();
    
    console.log('🎫 Token from storage:', token ? `${token.substring(0, 50)}... (length: ${token.length})` : 'null');
    
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

  // Call the original fetch with enhanced headers
  try {
    const response = await originalFetch(input, enhancedInit);
    
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
};

/**
 * Determine if a URL is an API call to our backend
 */
const isApiCallToBackend = (url: string): boolean => {
  const apiUrl = process.env.REACT_APP_VERCEL_API || 'http://localhost:3000';
  
  // Check if the URL starts with our API base URL or is a relative API path
  return url.startsWith(apiUrl) || 
         url.startsWith('/api/') || 
         url.includes('/api/');
};

let isInstalled = false;

/**
 * Initialize the API interceptor (functional approach)
 * Call this function early in your application startup
 */
export const initializeApiInterceptorV2 = (): void => {
  if (!isInstalled) {
    window.fetch = interceptedFetch;
    isInstalled = true;
    console.log('🚀 API Interceptor V2 installed - JWT tokens will be added automatically');
  }
};

/**
 * Clean up the API interceptor (functional approach)
 * Call this if you need to restore original fetch behavior
 */
export const cleanupApiInterceptorV2 = (): void => {
  if (isInstalled) {
    window.fetch = originalFetch;
    isInstalled = false;
    console.log('🔄 API Interceptor V2 uninstalled - restored original fetch');
  }
};