import { createClient } from './client';

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    from: jest.fn(),
  })),
}));

describe('supabase client', () => {
  it('exports createClient function', () => {
    expect(typeof createClient).toBe('function');
  });
});

