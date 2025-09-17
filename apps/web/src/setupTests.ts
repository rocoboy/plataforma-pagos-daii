// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    setTextColor: jest.fn(),
    text: jest.fn(),
    save: jest.fn(),
    setDrawColor: jest.fn(),
    setLineWidth: jest.fn(),
    rect: jest.fn(),
  }));
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock TextEncoder and TextDecoder for MUI DataGrid
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock crypto for MUI DataGrid - TEST ONLY, NOT FOR PRODUCTION
// This is a simple mock for testing purposes only
Object.defineProperty(global, 'crypto', {
  value: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getRandomValues: (arr: any) => {
      // Mock implementation that fills the array with predictable test values
      // This is NOT cryptographically secure - for tests only
      // Using a simple counter-based approach to avoid Math.random() warnings
      for (let i = 0; i < arr.length; i++) {
        arr[i] = (i * 7 + 13) % 256; // Simple deterministic pattern for testing
      }
      return arr;
    },
  },
});