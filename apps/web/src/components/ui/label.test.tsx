import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  it('renders with text', () => {
    render(<Label htmlFor="x">LabelX</Label>);
    expect(screen.getByText('LabelX')).toBeInTheDocument();
  });
});
