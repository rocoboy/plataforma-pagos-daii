import { initializeApiInterceptorV2, cleanupApiInterceptorV2 } from './apiInterceptorV2';

jest.mock('./auth', () => ({
  getStoredToken: jest.fn(() => 'mock-token')
}));

describe('apiInterceptorV2', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn(() => 
      Promise.resolve(new Response('{}', { status: 200 }))
    ) as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('initializes interceptor', () => {
    initializeApiInterceptorV2();
    expect(typeof window.fetch).toBe('function');
  });

  it('cleans up interceptor', () => {
    initializeApiInterceptorV2();
    cleanupApiInterceptorV2();
    expect(typeof window.fetch).toBe('function');
  });

  it('does not reinstall if already installed', () => {
    const originalConsoleLog = console.log;
    console.log = jest.fn();
    
    initializeApiInterceptorV2();
    initializeApiInterceptorV2();
    
    console.log = originalConsoleLog;
  });
});

