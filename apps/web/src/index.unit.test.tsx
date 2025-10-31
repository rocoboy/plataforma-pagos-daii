import React from 'react';

jest.mock('react-dom/client', () => ({
  createRoot: jest.fn(() => ({
    render: jest.fn()
  }))
}));

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: any) => <div>{children}</div>
}), { virtual: true });

jest.mock('./App', () => ({
  __esModule: true,
  default: () => <div>App</div>
}));

jest.mock('./reportWebVitals', () => jest.fn());

describe('index', () => {
  it('imports and initializes without error', () => {
    expect(() => {
      require('./index');
    }).not.toThrow();
  });
});

