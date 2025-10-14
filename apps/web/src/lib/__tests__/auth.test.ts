import {
  storeAuthData,
  getStoredToken,
  getStoredUser,
  isAuthenticated,
  isAdmin,
  clearAuthData,
  getAuthHeader,
  getDashboardUrl,
  createLoginRedirectUrl,
  checkUrlForToken,
  handleAuthCallback,
  User
} from '../auth';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Auth utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    // Reset window location
    delete (window as any).location;
    (window as any).location = {
      protocol: 'http:',
      host: 'localhost:3001',
      pathname: '/payments',
      search: '',
      hash: '',
      href: 'http://localhost:3001/payments'
    };
  });

  describe('storeAuthData', () => {
    it('stores token and user data in localStorage', () => {
      const token = 'test-token-123';
      const user: User = {
        id: '1',
        email: 'test@example.com',
        role: 'Usuario',
        name: 'Test User'
      };

      storeAuthData(token, user, 3600);

      expect(localStorage.getItem('auth_token')).toBe(token);
      const storedData = JSON.parse(localStorage.getItem('auth_user')!);
      expect(storedData.token).toBe(token);
      expect(storedData.user).toEqual(user);
      expect(storedData.expiresAt).toBeGreaterThan(Date.now());
    });

    it('sets expiration time correctly', () => {
      const token = 'test-token';
      const user: User = {
        id: '1',
        email: 'test@example.com',
        role: 'Usuario'
      };
      const expiresIn = 7200; // 2 hours

      const beforeStore = Date.now();
      storeAuthData(token, user, expiresIn);
      const afterStore = Date.now();

      const storedData = JSON.parse(localStorage.getItem('auth_user')!);
      const expectedMin = beforeStore + (expiresIn * 1000);
      const expectedMax = afterStore + (expiresIn * 1000);
      
      expect(storedData.expiresAt).toBeGreaterThanOrEqual(expectedMin);
      expect(storedData.expiresAt).toBeLessThanOrEqual(expectedMax);
    });
  });

  describe('getStoredToken', () => {
    it('returns stored token when valid', () => {
      const token = 'valid-token';
      const user: User = {
        id: '1',
        email: 'test@example.com',
        role: 'Usuario'
      };
      storeAuthData(token, user, 3600);

      expect(getStoredToken()).toBe(token);
    });

    it('returns null when no token is stored', () => {
      expect(getStoredToken()).toBeNull();
    });

    it('returns null and clears data when token is expired', () => {
      const token = 'expired-token';
      const user: User = {
        id: '1',
        email: 'test@example.com',
        role: 'Usuario'
      };
      
      // Store with negative expiration (already expired)
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify({
        token,
        user,
        expiresAt: Date.now() - 1000 // Expired 1 second ago
      }));

      expect(getStoredToken()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('handles corrupted data gracefully', () => {
      localStorage.setItem('auth_token', 'token');
      localStorage.setItem('auth_user', 'invalid-json');

      // When user data is corrupted, function returns null to be safe
      const token = getStoredToken();
      expect(token).toBeNull();
    });
  });

  describe('getStoredUser', () => {
    it('returns stored user when valid', () => {
      const token = 'valid-token';
      const user: User = {
        id: '1',
        email: 'test@example.com',
        role: 'Administrador',
        name: 'Admin User'
      };
      storeAuthData(token, user, 3600);

      const storedUser = getStoredUser();
      expect(storedUser).toEqual(user);
    });

    it('returns null when no user is stored', () => {
      expect(getStoredUser()).toBeNull();
    });

    it('returns null and clears data when token is expired', () => {
      localStorage.setItem('auth_user', JSON.stringify({
        token: 'expired-token',
        user: { id: '1', email: 'test@example.com', role: 'Usuario' },
        expiresAt: Date.now() - 1000
      }));

      expect(getStoredUser()).toBeNull();
    });

    it('handles corrupted data gracefully', () => {
      localStorage.setItem('auth_user', 'invalid-json');
      expect(getStoredUser()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when valid token exists', () => {
      const token = 'valid-token';
      const user: User = {
        id: '1',
        email: 'test@example.com',
        role: 'Usuario'
      };
      storeAuthData(token, user, 3600);

      expect(isAuthenticated()).toBe(true);
    });

    it('returns false when no token exists', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('returns false when token is expired', () => {
      localStorage.setItem('auth_token', 'expired-token');
      localStorage.setItem('auth_user', JSON.stringify({
        token: 'expired-token',
        user: { id: '1', email: 'test@example.com', role: 'Usuario' },
        expiresAt: Date.now() - 1000
      }));

      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('returns true for admin user', () => {
      const token = 'admin-token';
      const user: User = {
        id: '1',
        email: 'admin@example.com',
        role: 'Administrador'
      };
      storeAuthData(token, user, 3600);

      expect(isAdmin()).toBe(true);
    });

    it('returns false for regular user', () => {
      const token = 'user-token';
      const user: User = {
        id: '2',
        email: 'user@example.com',
        role: 'Usuario'
      };
      storeAuthData(token, user, 3600);

      expect(isAdmin()).toBe(false);
    });

    it('returns false when no user is stored', () => {
      expect(isAdmin()).toBe(false);
    });
  });

  describe('clearAuthData', () => {
    it('removes all auth data from localStorage', () => {
      const token = 'test-token';
      const user: User = {
        id: '1',
        email: 'test@example.com',
        role: 'Usuario'
      };
      storeAuthData(token, user, 3600);

      clearAuthData();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
    });
  });

  describe('getAuthHeader', () => {
    it('returns authorization header when token exists', () => {
      const token = 'test-token';
      const user: User = {
        id: '1',
        email: 'test@example.com',
        role: 'Usuario'
      };
      storeAuthData(token, user, 3600);

      const header = getAuthHeader();
      expect(header).toEqual({ Authorization: `Bearer ${token}` });
    });

    it('returns empty object when no token exists', () => {
      const header = getAuthHeader();
      expect(header).toEqual({});
    });
  });

  describe('getDashboardUrl', () => {
    it('returns correct dashboard URL', () => {
      const url = getDashboardUrl();
      expect(url).toBe('http://localhost:3001/payments');
    });
  });

  describe('createLoginRedirectUrl', () => {
    it('creates redirect URL with current location', () => {
      const url = createLoginRedirectUrl();
      expect(url).toContain('https://grupo5-usuarios.vercel.app/login');
      expect(url).toContain('redirect_uri=');
      expect(url).toContain(encodeURIComponent('http://localhost:3001/payments'));
    });

    it('redirects to dashboard when on login page', () => {
      window.location.pathname = '/login';
      window.location.href = 'http://localhost:3001/login';

      const url = createLoginRedirectUrl();
      expect(url).toContain('redirect_uri=');
      expect(url).toContain(encodeURIComponent('http://localhost:3001/payments'));
    });

    it('uses custom auth service URL from env', () => {
      const originalEnv = process.env.REACT_APP_AUTH_SERVICE_URL;
      process.env.REACT_APP_AUTH_SERVICE_URL = 'https://custom-auth.example.com';

      const url = createLoginRedirectUrl();
      expect(url).toContain('https://custom-auth.example.com/login');

      process.env.REACT_APP_AUTH_SERVICE_URL = originalEnv;
    });
  });

  describe('checkUrlForToken', () => {
    it('extracts token from URL hash', () => {
      const token = 'hash-token-123';
      const user = { id: '1', email: 'test@example.com', role: 'Usuario', name: 'Test' };
      window.location.hash = `#token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;

      // Mock history.replaceState
      window.history.replaceState = jest.fn();

      const result = checkUrlForToken();

      expect(result).toEqual({ token, user });
      expect(localStorage.getItem('auth_token')).toBe(token);
      expect(window.history.replaceState).toHaveBeenCalled();
    });

    it('handles token without user data', () => {
      const token = 'token-only';
      window.location.hash = `#token=${token}`;
      window.history.replaceState = jest.fn();

      const result = checkUrlForToken();

      expect(result?.token).toBe(token);
      expect(result?.user).toBeDefined();
      expect(result?.user.id).toBe('unknown');
    });

    it('returns null when no hash present', () => {
      window.location.hash = '';

      const result = checkUrlForToken();
      expect(result).toBeNull();
    });

    it('handles invalid data gracefully', () => {
      window.location.hash = '#token=abc&user=invalid-json';

      const result = checkUrlForToken();
      // Should not throw and handle gracefully
      expect(result).toBeDefined();
    });
  });

  describe('handleAuthCallback', () => {
    it('extracts token from URL parameters', () => {
      const token = 'param-token';
      const user = { id: '1', email: 'test@example.com', role: 'Usuario' };
      window.location.search = `?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
      window.history.replaceState = jest.fn();

      const result = handleAuthCallback();

      expect(result).toEqual({ token, user });
      expect(localStorage.getItem('auth_token')).toBe(token);
    });

    it('extracts token from URL hash when not in parameters', () => {
      const token = 'hash-token';
      const user = { id: '1', email: 'test@example.com', role: 'Usuario' };
      window.location.search = '';
      window.location.hash = `#token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`;
      window.history.replaceState = jest.fn();

      const result = handleAuthCallback();

      expect(result).toEqual({ token, user });
    });

    it('returns null when no token present', () => {
      window.location.search = '';
      window.location.hash = '';

      const result = handleAuthCallback();
      expect(result).toBeNull();
    });

    it('returns null when only token is present without user', () => {
      window.location.search = '?token=only-token';

      const result = handleAuthCallback();
      expect(result).toBeNull();
    });

    it('handles errors gracefully', () => {
      window.location.search = '?token=abc&user=invalid-json';

      const result = handleAuthCallback();
      expect(result).toBeNull();
    });
  });
});

