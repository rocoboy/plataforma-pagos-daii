import { initializeApiInterceptorV2, cleanupApiInterceptorV2 } from './apiInterceptorV2';

jest.mock('./auth', () => ({
  getStoredToken: jest.fn(() => 'mock-token')
}));

const { getStoredToken } = jest.requireMock('./auth');

const mockFetchImpl = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  return new Response('{}', { status: 200 });
});

describe('apiInterceptorV2', () => {
  const originalFetch = global.fetch;
  const originalWindowFetch = (window as any).fetch;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalLocation = window.location;
  const originalDispatchEvent = window.dispatchEvent;

  beforeEach(() => {
    (getStoredToken as jest.Mock).mockReturnValue('mock-token');
    mockFetchImpl.mockClear();
    mockFetchImpl.mockResolvedValue(new Response('{}', { status: 200 }));
    console.log = jest.fn();
    console.error = jest.fn();
    global.fetch = mockFetchImpl as any;
    (window as any).fetch = mockFetchImpl as any;
    process.env.REACT_APP_VERCEL_API = 'http://localhost:3000';
    
    delete (window as any).location;
    (window as any).location = { href: '' };
    
    window.dispatchEvent = jest.fn() as any;
  });

  afterEach(() => {
    cleanupApiInterceptorV2();
    global.fetch = originalFetch;
    (window as any).fetch = originalWindowFetch;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    (window as any).location = originalLocation;
    window.dispatchEvent = originalDispatchEvent;
    delete process.env.REACT_APP_VERCEL_API;
  });

  it('initializes interceptor', () => {
    initializeApiInterceptorV2();
    expect(typeof (window as any).fetch).toBe('function');
  });

  it('cleans up interceptor', () => {
    initializeApiInterceptorV2();
    const beforeCleanup = (window as any).fetch;
    cleanupApiInterceptorV2();
    const afterCleanup = (window as any).fetch;
    // After cleanup, fetch should be different from before
    expect(afterCleanup).not.toBe(beforeCleanup);
  });

  it('does not reinstall if already installed', () => {
    initializeApiInterceptorV2();
    const firstFetch = (window as any).fetch;
    initializeApiInterceptorV2();
    const secondFetch = (window as any).fetch;
    expect(firstFetch).toBe(secondFetch);
  });

});

