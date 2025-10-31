describe('apiInterceptor - Basic', () => {
  it('exports apiInterceptor', () => {
    const { apiInterceptor } = require('./apiInterceptor');
    expect(apiInterceptor).toBeDefined();
  });

  it('exports initialization functions', () => {
    const { initializeApiInterceptor, cleanupApiInterceptor } = require('./apiInterceptor');
    expect(initializeApiInterceptor).toBeDefined();
    expect(cleanupApiInterceptor).toBeDefined();
  });
});

