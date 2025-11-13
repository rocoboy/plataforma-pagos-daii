import { NextRequest } from 'next/server';
import { createClient, createAdminClient } from './server';

describe('Supabase Server - Coverage', () => {
  it('exports createClient and createAdminClient functions', () => {
    expect(typeof createClient).toBe('function');
    expect(typeof createAdminClient).toBe('function');
  });
});

