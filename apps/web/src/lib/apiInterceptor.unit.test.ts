import { apiInterceptor, initializeApiInterceptor, cleanupApiInterceptor } from './apiInterceptor';

jest.mock('./auth', () => ({
  getStoredToken: jest.fn()
}));

const { getStoredToken } = jest.requireMock('./auth');

const mockFetchImpl = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  return {
    status: 200,
    statusText: 'OK',
    json: async () => ({}),
  } as any;
});

describe('apiInterceptor', () => {
  const originalGlobalFetch = global.fetch;
  // @ts-ignore
  const originalWindowFetch = window.fetch;

  beforeEach(() => {
    (getStoredToken as jest.Mock).mockReset();
    mockFetchImpl.mockClear();
  });

  afterEach(() => {
    global.fetch = originalGlobalFetch as any;
    // @ts-ignore
    window.fetch = originalWindowFetch as any;
    jest.resetModules();
  });

  it('installs and uninstalls without errors', async () => {
    // Mock fetch BEFORE importing module
    // @ts-ignore
    global.fetch = mockFetchImpl;
    // @ts-ignore
    window.fetch = mockFetchImpl;

    let initializeApiInterceptor: any;
    let cleanupApiInterceptor: any;

    jest.isolateModules(() => {
      const mod = require('./apiInterceptor');
      initializeApiInterceptor = mod.initializeApiInterceptor;
      cleanupApiInterceptor = mod.cleanupApiInterceptor;
    });

    expect(() => initializeApiInterceptor()).not.toThrow();
    expect(typeof global.fetch).toBe('function');
    expect(() => cleanupApiInterceptor()).not.toThrow();
  });
});
