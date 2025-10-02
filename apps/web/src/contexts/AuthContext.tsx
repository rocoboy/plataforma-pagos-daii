import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  getStoredToken, 
  getStoredUser, 
  storeAuthData, 
  clearAuthData, 
  isAuthenticated as checkAuthenticated,
  isAdmin as checkIsAdmin,
  handleAuthCallback,
  checkUrlForToken
} from '../lib/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage and URL
  useEffect(() => {
    const initializeAuth = () => {
      setIsLoading(true);
      
      // FIRST: Check URL for token fragment (#token=...) - Acceptance Criteria requirement
      const urlTokenData = checkUrlForToken();
      if (urlTokenData) {
        setToken(urlTokenData.token);
        setUser(urlTokenData.user);
        setIsLoading(false);
        return;
      }
      
      // SECOND: Check for auth callback in URL parameters (from external login)
      const callbackData = handleAuthCallback();
      if (callbackData) {
        setToken(callbackData.token);
        setUser(callbackData.user);
        setIsLoading(false);
        return;
      }
      
      // THIRD: Check localStorage for existing session
      const storedToken = getStoredToken();
      const storedUser = getStoredUser();
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    storeAuthData(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    clearAuthData();
    setToken(null);
    setUser(null);
  };

  const refreshAuth = () => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    } else {
      setToken(null);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: checkAuthenticated(),
    isAdmin: checkIsAdmin(),
    isLoading,
    login,
    logout,
    refreshAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};