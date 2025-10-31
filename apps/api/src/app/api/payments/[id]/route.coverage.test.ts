import * as routeModule from './route';

describe('Payment ID Route - Coverage', () => {
  it('exports GET handler', () => {
    expect(routeModule.GET).toBeDefined();
    expect(typeof routeModule.GET).toBe('function');
  });
});

