import React from 'react';
import ReactDOM from 'react-dom/client';

// Mock ReactDOM to avoid actual rendering
jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn(),
  })),
}));

// Mock the App component
jest.mock('../App', () => {
  return function MockApp() {
    return React.createElement('div', null, 'Mock App');
  };
});

// Mock BrowserRouter
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock reportWebVitals
jest.mock('../reportWebVitals', () => jest.fn());

describe('index.tsx', () => {
  let consoleErrorSpy: jest.SpyInstance;
  const originalGetElementById = document.getElementById;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Create a mock root element
    const mockRootElement = document.createElement('div');
    mockRootElement.id = 'root';
    
    // Mock document.getElementById to return our mock element
    document.getElementById = jest.fn().mockReturnValue(mockRootElement);
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    document.getElementById = originalGetElementById;
  });

  it('should create root and render app', () => {
    // Clear module cache to force re-execution
    jest.resetModules();
    
    // Re-import mocks
    jest.mock('react-dom/client');
    jest.mock('../App');
    jest.mock('react-router-dom');
    
    // Import index to execute it
    require('../index');

    // Verify createRoot was called
    expect(ReactDOM.createRoot).toHaveBeenCalled();
  });

  it('should query for root element', () => {
    jest.resetModules();
    (document.getElementById as jest.Mock).mockClear();
    
    require('../index');

    expect(document.getElementById).toHaveBeenCalledWith('root');
  });
});


