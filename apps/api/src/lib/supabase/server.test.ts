// Mock BEFORE importing
const mockServerClient = {
  from: jest.fn(),
};

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => mockServerClient),
}));

import { NextRequest } from 'next/server';
import { createClient } from './server';

describe('supabase server', () => {
  const originalEnv = process.env;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules(); // Reset to clear module-level variables
    process.env = { ...originalEnv };
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';
    console.log = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    console.log = originalConsoleLog;
    jest.resetModules();
  });

  it('should create supabase client successfully', async () => {
    const { createClient } = await import('./server');
    const req = new NextRequest('http://localhost');
    const client = createClient(req);
    
    expect(client).toBeDefined();
    expect(client).toBe(mockServerClient);
  });

  it('should throw error when SUPABASE_URL is missing', async () => {
    delete process.env.SUPABASE_URL;
    jest.resetModules();
    const { createClient } = await import('./server');
    const req = new NextRequest('http://localhost');
    
    expect(() => createClient(req)).toThrow('Missing SUPABASE_URL environment variable');
  });

  it('should throw error when SUPABASE_ANON_KEY is missing', async () => {
    delete process.env.SUPABASE_ANON_KEY;
    jest.resetModules();
    const { createClient } = await import('./server');
    const req = new NextRequest('http://localhost');
    
    expect(() => createClient(req)).toThrow('Missing SUPABASE_ANON_KEY environment variable');
  });

  it('should log in development mode', async () => {
    process.env.NODE_ENV = 'development';
    jest.resetModules();
    const { createClient } = await import('./server');
    const req = new NextRequest('http://localhost');
    
    createClient(req);
    
    expect(console.log).toHaveBeenCalledWith(
      'Creating Supabase client with URL:',
      'https://test.supabase.co'
    );
  });

  it('should not log in production mode', async () => {
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    const { createClient } = await import('./server');
    const req = new NextRequest('http://localhost');
    
    createClient(req);
    
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should handle cookies correctly', async () => {
    const { createClient } = await import('./server');
    const req = new NextRequest('http://localhost');
    const mockCookies = {
      getAll: jest.fn(() => [{ name: 'test', value: 'value' }]),
      set: jest.fn(),
    };
    
    // Mock cookies
    Object.defineProperty(req, 'cookies', {
      value: mockCookies,
      writable: true,
    });

    createClient(req);
    
    const createServerClientMock = require('@supabase/ssr').createServerClient;
    expect(createServerClientMock).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    );
  });
});

