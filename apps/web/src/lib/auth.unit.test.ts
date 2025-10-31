import { storeAuthData, getStoredToken, getStoredUser, clearAuthData, isAuthenticated, isAdmin } from './auth';

describe('auth helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and retrieves token', () => {
    const user = { id: '1', email: 'a@b.com', role: 'Usuario' };
    storeAuthData('tk', user);
    expect(getStoredToken()).toBe('tk');
  });

  it('stores and retrieves user', () => {
    const user = { id: '1', email: 'a@b.com', role: 'Usuario' };
    storeAuthData('tk', user);
    const retrieved = getStoredUser();
    expect(retrieved).toMatchObject(user);
  });

  it('clears auth data', () => {
    const user = { id: '1', email: 'a@b.com', role: 'Usuario' };
    storeAuthData('tk', user);
    clearAuthData();
    expect(getStoredToken()).toBeNull();
  });

  it('checks isAuthenticated', () => {
    expect(isAuthenticated()).toBe(false);
    const user = { id: '1', email: 'a@b.com', role: 'Usuario' };
    storeAuthData('tk', user);
    expect(isAuthenticated()).toBe(true);
  });

  it('checks isAdmin', () => {
    const user = { id: '1', email: 'a@b.com', role: 'Administrador' };
    storeAuthData('tk', user);
    expect(isAdmin()).toBe(true);
  });
});

