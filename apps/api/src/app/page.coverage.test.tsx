describe('API Page - Coverage', () => {
  it('page file exists', () => {
    const page = require('./page');
    expect(page).toBeDefined();
  });

  it('exports default component', () => {
    const page = require('./page');
    expect(page.default).toBeDefined();
  });

  it('default export is a function', () => {
    const page = require('./page');
    expect(typeof page.default).toBe('function');
  });
});

