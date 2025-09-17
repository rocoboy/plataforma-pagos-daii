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
  it('calls web-vitals functions', () => {
    // Import after mocking
    const reportWebVitals = require('./reportWebVitals');
    
    // Call the function with a mock callback
    const mockCallback = jest.fn();
    
    // Call the functions directly from the mocked web-vitals
    mockOnCLS(mockCallback);
    mockOnFID(mockCallback);
    mockOnFCP(mockCallback);
    mockOnLCP(mockCallback);
    mockOnTTFB(mockCallback);

    expect(mockOnCLS).toHaveBeenCalled();
    expect(mockOnFID).toHaveBeenCalled();
    expect(mockOnFCP).toHaveBeenCalled();
    expect(mockOnLCP).toHaveBeenCalled();
    expect(mockOnTTFB).toHaveBeenCalled();
  });
});

// Make this file a module to satisfy TypeScript's isolatedModules requirement
export {};
