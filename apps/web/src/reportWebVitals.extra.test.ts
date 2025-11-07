import reportWebVitals from './reportWebVitals';

describe('reportWebVitals - Coverage', () => {
  it('is a function', () => {
    expect(typeof reportWebVitals).toBe('function');
  });

  it('can be called with undefined', () => {
    expect(() => reportWebVitals()).not.toThrow();
  });

  it('can be called with a function', () => {
    const mockFn = jest.fn();
    expect(() => reportWebVitals(mockFn)).not.toThrow();
  });

  it('can be called with console.log', () => {
    expect(() => reportWebVitals(console.log)).not.toThrow();
  });
});

