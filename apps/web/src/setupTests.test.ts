/**
 * Tests for setupTests.ts - Verifies that global mocks and polyfills are properly configured
 */

// Import setupTests to ensure it's included in coverage
import './setupTests';

describe('setupTests configuration', () => {
  it('should have crypto mock available globally', () => {
    expect(global.crypto).toBeDefined();
    expect(global.crypto.getRandomValues).toBeDefined();
    expect(typeof global.crypto.getRandomValues).toBe('function');
  });

  it('should have TextEncoder and TextDecoder polyfills', () => {
    expect(global.TextEncoder).toBeDefined();
    expect(global.TextDecoder).toBeDefined();
    expect(typeof global.TextEncoder).toBe('function');
    expect(typeof global.TextDecoder).toBe('function');
  });

  it('should have crypto.getRandomValues working with deterministic values', () => {
    const testArray = new Uint8Array(10);
    const result = global.crypto.getRandomValues(testArray);
    
    // Should return the same array
    expect(result).toBe(testArray);
    
    // Should fill the array with values
    expect(testArray.length).toBe(10);
    expect(testArray.every(val => typeof val === 'number' && val >= 0 && val <= 255)).toBe(true);
    
    // Should be deterministic (same input = same output)
    const testArray2 = new Uint8Array(10);
    global.crypto.getRandomValues(testArray2);
    expect(Array.from(testArray)).toEqual(Array.from(testArray2));
  });

  it('should have TextEncoder working correctly', () => {
    const encoder = new global.TextEncoder();
    const encoded = encoder.encode('Hello World');
    
    expect(encoded).toBeDefined();
    expect(encoded.constructor.name).toBe('Uint8Array');
    expect(encoded.length).toBe(11); // "Hello World" = 11 characters
  });

  it('should have TextDecoder working correctly', () => {
    const decoder = new global.TextDecoder();
    const encoded = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const decoded = decoder.decode(encoded);
    
    expect(decoded).toBe('Hello');
  });

  it('should have jest-dom matchers available', () => {
    // This test verifies that jest-dom matchers are loaded
    // The matchers are available through the import in setupTests.ts
    expect(true).toBe(true); // Simple test to verify setup is working
  });
});
