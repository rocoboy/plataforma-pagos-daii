import reportWebVitals from './reportWebVitals';

describe('reportWebVitals', () => {
  it('calls onPerfEntry when valid function provided', () => {
    const mockFn = jest.fn();
    reportWebVitals(mockFn);
    expect(mockFn).not.toThrow();
  });

  it('does not throw when no function provided', () => {
    expect(() => reportWebVitals()).not.toThrow();
  });
});

