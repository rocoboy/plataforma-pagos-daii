import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders with text', () => {
    render(<Badge>OK</Badge>);
    expect(screen.getByText('OK')).toBeInTheDocument();
  });
});
