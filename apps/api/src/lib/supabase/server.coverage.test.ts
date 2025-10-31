describe('Supabase Server - Coverage', () => {
  it('server file exists', () => {
    const server = require('./server');
    expect(server).toBeDefined();
  });

  it('exports createClient', () => {
    const server = require('./server');
    expect(server.createClient).toBeDefined();
  });

  it('createClient is a function', () => {
    const server = require('./server');
    expect(typeof server.createClient).toBe('function');
  });
});

