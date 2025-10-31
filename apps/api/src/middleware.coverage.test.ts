import * as middlewareModule from './middleware';

describe('Global Middleware - Coverage', () => {
  it('exports middleware handler', () => {
    expect(middlewareModule.middleware).toBeDefined();
    expect(typeof middlewareModule.middleware).toBe('function');
  });

  it('exports config matcher', () => {
    expect(middlewareModule.config).toBeDefined();
    expect(middlewareModule.config.matcher).toBeDefined();
  });
});


