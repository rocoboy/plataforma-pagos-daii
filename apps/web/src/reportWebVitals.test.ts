// Mock web-vitals
const mockOnCLS = jest.fn();
const mockOnFID = jest.fn();
const mockOnFCP = jest.fn();
const mockOnLCP = jest.fn();
const mockOnTTFB = jest.fn();

jest.mock('web-vitals', () => ({
  onCLS: mockOnCLS,
  onFID: mockOnFID,
  onFCP: mockOnFCP,
  onLCP: mockOnLCP,
  onTTFB: mockOnTTFB,
}));

describe('reportWebVitals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not throw when called without a callback', () => {
    const reportWebVitals = require('./reportWebVitals').default;
    expect(() => reportWebVitals()).not.toThrow();
  });

  it('should not throw when called with undefined', () => {
    const reportWebVitals = require('./reportWebVitals').default;
    expect(() => reportWebVitals(undefined)).not.toThrow();
  });

  it('should call web-vitals functions when callback is provided', () => {
    const reportWebVitals = require('./reportWebVitals').default;
    const mockCallback = jest.fn();
    
    reportWebVitals(mockCallback);

    // The function should import web-vitals and call each metric function with the callback
    expect(mockOnCLS).toHaveBeenCalledWith(mockCallback);
    expect(mockOnFID).toHaveBeenCalledWith(mockCallback);
    expect(mockOnFCP).toHaveBeenCalledWith(mockCallback);
    expect(mockOnLCP).toHaveBeenCalledWith(mockCallback);
    expect(mockOnTTFB).toHaveBeenCalledWith(mockCallback);
  });

  it('should be a function', () => {
    const reportWebVitals = require('./reportWebVitals').default;
    expect(typeof reportWebVitals).toBe('function');
  });

  it('should handle function callbacks correctly', () => {
    const reportWebVitals = require('./reportWebVitals').default;
    const callback = jest.fn();
    
    reportWebVitals(callback);
    
    // Verify the callback was passed to all metrics
    expect(mockOnCLS).toHaveBeenCalledWith(callback);
    expect(mockOnFID).toHaveBeenCalledWith(callback);
  });
});

// Make this file a module to satisfy TypeScript's isolatedModules requirement
export {};
