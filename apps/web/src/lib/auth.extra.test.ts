import {
  storeAuthData,
  getStoredToken,
  getStoredUser,
  clearAuthData,
  isAuthenticated,
  isAdmin,
} from './auth';

describe('Auth - Extra Coverage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('storeAuthData', () => {
    it('stores admin user data', () => {
      const user = { id: '1', email: 'admin@test.com', role: 'Administrador' as const, name: 'Admin' };
      storeAuthData('admin-token', user);
      
      const stored = getStoredUser();
      expect(stored?.role).toBe('Administrador');
    });

    it('stores user with long token', () => {
      const longToken = 'a'.repeat(500);
      const user = { id: '1', email: 'test@test.com', role: 'Usuario' as const };
      storeAuthData(longToken, user);
      
      const token = getStoredToken();
      expect(token).toBe(longToken);
    });

    it('stores user without name', () => {
      const user = { id: '2', email: 'user2@test.com', role: 'Usuario' as const };
      storeAuthData('token2', user);
      
      const stored = getStoredUser();
      expect(stored?.id).toBe('2');
    });
  });

  describe('getStoredToken', () => {
    it('returns null when no token stored', () => {
      const token = getStoredToken();
      expect(token).toBeNull();
    });

    it('returns token when valid', () => {
      const user = { id: '1', email: 'test@test.com', role: 'Usuario' as const };
      storeAuthData('my-token', user);
      
      const token = getStoredToken();
      expect(token).toBe('my-token');
    });
  });

  describe('getStoredUser', () => {
    it('returns null when no user stored', () => {
      const user = getStoredUser();
      expect(user).toBeNull();
    });

    it('returns user when valid', () => {
      const user = { id: '1', email: 'test@test.com', role: 'Usuario' as const, name: 'Test' };
      storeAuthData('token', user);
      
      const stored = getStoredUser();
      expect(stored?.name).toBe('Test');
    });
  });

  describe('clearAuthData', () => {
    it('clears stored data', () => {
      const user = { id: '1', email: 'test@test.com', role: 'Usuario' as const };
      storeAuthData('token', user);
      
      clearAuthData();
      
      expect(getStoredToken()).toBeNull();
      expect(getStoredUser()).toBeNull();
    });

    it('can be called multiple times', () => {
      clearAuthData();
      clearAuthData();
      clearAuthData();
      
      expect(getStoredToken()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('returns false when no token', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true when token exists', () => {
      const user = { id: '1', email: 'test@test.com', role: 'Usuario' as const };
      storeAuthData('token', user);
      
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe('isAdmin', () => {
    it('returns false when no user', () => {
      expect(isAdmin()).toBe(false);
    });

    it('returns false for Usuario role', () => {
      const user = { id: '1', email: 'test@test.com', role: 'Usuario' as const };
      storeAuthData('token', user);
      
      expect(isAdmin()).toBe(false);
    });

    it('returns true for Administrador role', () => {
      const user = { id: '1', email: 'admin@test.com', role: 'Administrador' as const };
      storeAuthData('token', user);
      
      expect(isAdmin()).toBe(true);
    });
  });
});

