import React from 'react';
import { render } from '@testing-library/react';
import { AuthProvider } from './AuthContext';

describe('AuthContext - Simple', () => {
  it('renders children', () => {
    const { getByText } = render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    );
    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('provides context without crashing', () => {
    expect(() => {
      render(
        <AuthProvider>
          <div>Content</div>
        </AuthProvider>
      );
    }).not.toThrow();
  });
});

