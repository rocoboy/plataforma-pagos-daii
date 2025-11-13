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
    headers: new Headers(),
  } as any;
});

describe('apiInterceptor', () => {
  const originalGlobalFetch = global.fetch;
  const originalWindowFetch = (window as any).fetch;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    (getStoredToken as jest.Mock).mockReset();
    mockFetchImpl.mockClear();
    console.log = jest.fn();
    console.error = jest.fn();
    global.fetch = mockFetchImpl as any;
    (window as any).fetch = mockFetchImpl as any;
    process.env.REACT_APP_VERCEL_API = 'http://localhost:3000';
  });

  afterEach(() => {
    cleanupApiInterceptor();
    global.fetch = originalGlobalFetch;
    (window as any).fetch = originalWindowFetch;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    delete process.env.REACT_APP_VERCEL_API;
  });

  it('installs and uninstalls without errors', () => {
    expect(() => initializeApiInterceptor()).not.toThrow();
    expect(typeof (window as any).fetch).toBe('function');
    expect(() => cleanupApiInterceptor()).not.toThrow();
  });

});
