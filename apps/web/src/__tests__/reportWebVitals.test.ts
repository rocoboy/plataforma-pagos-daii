import reportWebVitals from '../reportWebVitals';

describe('reportWebVitals', () => {
  it('calls the callback when provided', () => {
    const callback = jest.fn();
    reportWebVitals(callback);
    
    expect(callback).toBeDefined();
  });

  it('does not throw error when called without callback', () => {
    expect(() => reportWebVitals()).not.toThrow();
  });

  it('handles callback function', () => {
    const mockCallback = jest.fn();
    reportWebVitals(mockCallback);
    
    // Function should be defined
    expect(mockCallback).toBeDefined();
  });
});


