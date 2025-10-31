import React from 'react';
import { render } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  __esModule: true,
  Routes: ({ children }: any) => <div>{children}</div>,
  Route: () => null,
  Navigate: () => null,
  useLocation: () => ({ pathname: '/payments' })
}), { virtual: true });

jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(() => ({ defaultOptions: {} })),
  QueryClientProvider: ({ children }: any) => <div>{children}</div>
}));

jest.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => null
}));

jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: any) => <div>{children}</div>
}));

jest.mock('./lib/apiInterceptorV2', () => ({
  initializeApiInterceptorV2: jest.fn()
}));

import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});

