// Authentication utilities for token management

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export interface AuthToken {
  token: string;
  user: User;
  expiresAt: number;
}

// Token storage keys
const TOKEN_STORAGE_KEY = 'auth_token';
const USER_STORAGE_KEY = 'auth_user';

/**
 * Store JWT token and user data in localStorage
 */
export const storeAuthData = (token: string, user: User, expiresIn: number = 3600): void => {
  console.log('💾 Storing auth data:', { 
    tokenLength: token.length, 
    tokenStart: token.substring(0, 50),
    user 
  });
  
  const expiresAt = Date.now() + (expiresIn * 1000); // Convert seconds to milliseconds
  
  const authToken: AuthToken = {
    token,
    user,
    expiresAt
  };
  
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authToken));
  
  console.log('💾 Token stored. Retrieved immediately:', localStorage.getItem(TOKEN_STORAGE_KEY)?.substring(0, 50));
};

/**
 * Get stored JWT token from localStorage
 */
export const getStoredToken = (): string | null => {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    console.log('🔍 Retrieved token from storage:', token ? `${token.substring(0, 50)}... (length: ${token.length})` : 'null');
    
    if (!token) return null;
    
    // Check if token is expired
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    if (userData) {
      const authData: AuthToken = JSON.parse(userData);
      if (Date.now() > authData.expiresAt) {
        // Token expired, clear storage
        console.log('⏰ Token expired, clearing storage');
        clearAuthData();
        return null;
      }
    }
    
    return token;
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
};

/**
 * Get stored user data from localStorage
 */
export const getStoredUser = (): User | null => {
  try {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    if (!userData) return null;
    
    const authData: AuthToken = JSON.parse(userData);
    
    // Check if token is expired
    if (Date.now() > authData.expiresAt) {
      clearAuthData();
      return null;
    }
    
    return authData.user;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  return getStoredToken() !== null;
};

/**
 * Check if user has admin role
 */
export const isAdmin = (): boolean => {
  const user = getStoredUser();
  return user?.role === 'Administrador';
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Get the main dashboard URL
 */
export const getDashboardUrl = (): string => {
  return `${window.location.protocol}//${window.location.host}/payments`;
};

/**
 * Create redirect URL for login with current location
 */
export const createLoginRedirectUrl = (): string => {
  // Get the complete URL of our dashboard/console
  let redirectUrl = window.location.href;
  
  // If user is on login page, redirect to main dashboard instead
  if (window.location.pathname === '/login') {
    redirectUrl = getDashboardUrl(); // Main dashboard
  }
  
  const encodedUrl = encodeURIComponent(redirectUrl);
  return `https://grupo5-usuarios.vercel.app/login?redirect_uri=${encodedUrl}`;
};

/**
 * Check for token in URL fragment (#) and extract it
 * This specifically handles the acceptance criteria requirement
 */
export const checkUrlForToken = (): { token: string; user: User } | null => {
  try {
    console.log('🔍 Checking URL for token fragment...', window.location.hash);
    
    // Check if URL contains hash fragment with token
    if (window.location.hash) {
      console.log('🔍 Full hash:', window.location.hash);
      console.log('🔍 Hash length:', window.location.hash.length);
      
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const token = hashParams.get('token');
      const userData = hashParams.get('user');
      
      console.log('📍 Found hash params:', { 
        hasToken: !!token, 
        hasUser: !!userData,
        tokenLength: token?.length,
        tokenStart: token?.substring(0, 50)
      });
      
      if (token) {
        let user: User;
        
        // If user data is provided, parse it; otherwise create minimal user object
        if (userData) {
          user = JSON.parse(decodeURIComponent(userData));
          console.log('👤 Parsed user data:', user);
        } else {
          // Fallback user object if only token is provided
          user = {
            id: 'unknown',
            email: 'unknown@example.com',
            role: 'Usuario', // Default role
            name: 'Usuario'
          };
          console.log('👤 Using fallback user data:', user);
        }
        
        // Store token securely in browser storage
        storeAuthData(token, user);
        console.log('💾 Token stored securely');
        
        // Clean URL to remove visible token from address bar
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState({}, document.title, cleanUrl);
        console.log('🧹 URL cleaned, token removed from address bar');
        
        return { token, user };
      }
    }
    
    console.log('❌ No token found in URL fragment');
    return null;
  } catch (error) {
    console.error('❌ Error checking URL for token:', error);
    return null;
  }
};

/**
 * Handle login redirect from external auth service
 * Supports both URL parameters and hash fragments for token capture
 */
export const handleAuthCallback = (): { token: string; user: User } | null => {
  try {
    let token: string | null = null;
    let userData: string | null = null;
    
    // Check URL parameters first (original implementation)
    const urlParams = new URLSearchParams(window.location.search);
    token = urlParams.get('token');
    userData = urlParams.get('user');
    
    // If not found in parameters, check hash fragment (#token=...)
    if (!token && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1)); // Remove # prefix
      token = hashParams.get('token');
      userData = hashParams.get('user');
    }
    
    if (token && userData) {
      const user: User = JSON.parse(decodeURIComponent(userData));
      storeAuthData(token, user);
      
      // Clean up URL parameters AND hash fragments
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      return { token, user };
    }
    
    return null;
  } catch (error) {
    console.error('Error handling auth callback:', error);
    return null;
  }
};