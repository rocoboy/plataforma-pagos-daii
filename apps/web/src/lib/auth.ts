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
  const expiresAt = Date.now() + (expiresIn * 1000); // Convert seconds to milliseconds
  
  const authToken: AuthToken = {
    token,
    user,
    expiresAt
  };
  
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authToken));
};

/**
 * Get stored JWT token from localStorage
 */
export const getStoredToken = (): string | null => {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return null;
    
    // Check if token is expired
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    if (userData) {
      const authData: AuthToken = JSON.parse(userData);
      if (Date.now() > authData.expiresAt) {
        // Token expired, clear storage
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
 * Handle login redirect from external auth service
 */
export const handleAuthCallback = (): { token: string; user: User } | null => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userData = urlParams.get('user');
    
    if (token && userData) {
      const user: User = JSON.parse(decodeURIComponent(userData));
      storeAuthData(token, user);
      
      // Clean up URL parameters
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