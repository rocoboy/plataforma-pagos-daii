jest.mock('./auth', () => ({
  getStoredToken: jest.fn()
}));

const { getStoredToken } = jest.requireMock('./auth');

const mockFetchImpl = jest.fn(async () => ({
  status: 200,
  statusText: 'OK',
  json: async () => ({})
}) as any);

describe('apiInterceptorV2', () => {
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

  it('injects Authorization header when token exists', async () => {
    // @ts-ignore
    global.fetch = mockFetchImpl;
    // @ts-ignore
    window.fetch = mockFetchImpl;
    (getStoredToken as jest.Mock).mockReturnValue('tkn');

    let initialize: any;
    jest.isolateModules(() => {
      const mod = require('./apiInterceptorV2');
      initialize = mod.initializeApiInterceptorV2;
    });

    initialize();

    const spy = jest.spyOn(globalThis, 'fetch' as any);
    await fetch('/api/whatever');

    const [, init] = (spy as any).mock.calls[0];
    const headers = new Headers(init?.headers);
    expect(headers.get('Authorization')).toBe('Bearer tkn');
  });
});
