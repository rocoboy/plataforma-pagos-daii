describe('Users Route - Coverage', () => {
  it('exports GET handler', () => {
    const route = require('./route');
    expect(route.GET).toBeDefined();
    expect(typeof route.GET).toBe('function');
  });
});

