import { createClient } from './client';

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    from: jest.fn(),
  })),
}));

describe('supabase client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('creates browser client successfully', () => {
    const client = createClient();
    expect(client).toBeDefined();
  });
});

