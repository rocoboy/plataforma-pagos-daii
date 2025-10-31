import * as serverModule from './server';

describe('Supabase Server - Coverage', () => {
  it('server file exists', () => {
    expect(serverModule).toBeDefined();
  });

  it('exports createClient', () => {
    expect(serverModule.createClient).toBeDefined();
  });

  it('createClient is a function', () => {
    expect(typeof serverModule.createClient).toBe('function');
  });
});

