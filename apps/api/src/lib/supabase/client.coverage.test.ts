import * as clientModule from './client';

describe('Supabase Client - Coverage', () => {
  it('client file exists', () => {
    expect(clientModule).toBeDefined();
  });

  it('exports createClient', () => {
    expect(clientModule.createClient).toBeDefined();
  });

  it('createClient is a function', () => {
    expect(typeof clientModule.createClient).toBe('function');
  });
});

