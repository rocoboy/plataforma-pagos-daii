import React from 'react';
import { render, screen } from '@testing-library/react';
import { Label } from '../label';

describe('Label', () => {
  it('renders label with children', () => {
    render(<Label>Label Text</Label>);
    expect(screen.getByText('Label Text')).toBeInTheDocument();
  });

  it('associates with input using htmlFor', () => {
    render(
      <div>
        <Label htmlFor="test-input">Email</Label>
        <input id="test-input" type="text" />
      </div>
    );
    
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('applies custom className', () => {
    render(<Label className="custom-label">Custom</Label>);
    const label = screen.getByText('Custom');
    expect(label).toHaveClass('custom-label');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLLabelElement>();
    render(<Label ref={ref}>Label</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });
});

