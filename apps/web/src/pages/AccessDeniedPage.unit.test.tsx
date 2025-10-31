import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  __esModule: true,
  Link: ({ children, to }: any) => <a href={to}>{children}</a>
}), { virtual: true });

jest.mock('../components/AccessDenied', () => ({
  __esModule: true,
  default: () => <div>AccessDenied Component</div>
}));

import AccessDeniedPage from './AccessDeniedPage';

describe('AccessDeniedPage', () => {
  it('renders AccessDenied component', () => {
    render(<AccessDeniedPage />);
    expect(screen.getByText('AccessDenied Component')).toBeInTheDocument();
  });
});

