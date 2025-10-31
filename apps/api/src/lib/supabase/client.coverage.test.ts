describe('Supabase Client - Coverage', () => {
  it('client file exists', () => {
    const client = require('./client');
    expect(client).toBeDefined();
  });

  it('exports createClient', () => {
    const client = require('./client');
    expect(client.createClient).toBeDefined();
  });

  it('createClient is a function', () => {
    const client = require('./client');
    expect(typeof client.createClient).toBe('function');
  });
});

