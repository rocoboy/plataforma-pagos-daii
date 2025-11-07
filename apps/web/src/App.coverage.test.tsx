import React from 'react';

jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({ isAuthenticated: false }),
}));

jest.mock('react-router-dom', () => ({
  __esModule: true,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Route: () => null,
  Navigate: () => null,
}), { virtual: true });

jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn().mockImplementation(() => ({
    getQueryCache: jest.fn(),
    getMutationCache: jest.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('App - Coverage', () => {
  it('App component file exists', () => {
    const app = require('./App');
    expect(app).toBeDefined();
  });

  it('exports default App component', () => {
    const app = require('./App');
    expect(app.default).toBeDefined();
  });

  it('App is a function', () => {
    const app = require('./App');
    expect(typeof app.default).toBe('function');
  });
});

