import * as pageModule from './page';

describe('API Page - Coverage', () => {
  it('page file exists', () => {
    expect(pageModule).toBeDefined();
  });

  it('exports default component', () => {
    expect(pageModule.default).toBeDefined();
  });

  it('default export is a function', () => {
    expect(typeof pageModule.default).toBe('function');
  });
});

