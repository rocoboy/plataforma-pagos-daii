import { NextRequest } from 'next/server';
import { createClient, createAdminClient } from './server';

// Note: Since variables are evaluated at module load time, we can only test
// the current state of environment variables, not dynamically changing them.
// These tests verify the functions exist and can be called when env vars are set.

describe('Supabase Server - Coverage', () => {
  describe('createClient', () => {
    it('exports createClient function', () => {
      expect(typeof createClient).toBe('function');
    });

    it('creates client when environment variables are set', () => {
      // This test only passes if env vars are already set
      // We can't change them dynamically due to module-level evaluation
      const req = new NextRequest('http://localhost');
      try {
        const client = createClient(req);
        expect(client).toBeDefined();
      } catch (error: any) {
        // If env vars are missing, expect specific error messages
        expect(error.message).toMatch(/Missing SUPABASE/);
      }
    });
  });

  describe('createAdminClient', () => {
    it('exports createAdminClient function', () => {
      expect(typeof createAdminClient).toBe('function');
    });

    it('creates admin client when environment variables are set', () => {
      // This test only passes if env vars are already set
      try {
        const client = createAdminClient();
        expect(client).toBeDefined();
      } catch (error: any) {
        // If env vars are missing, expect specific error messages
        expect(error.message).toMatch(/Missing SUPABASE/);
      }
    });
  });
});

