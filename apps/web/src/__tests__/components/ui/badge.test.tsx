import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '../../../components/ui/badge';

describe('Badge', () => {
  it('renders badge with children', () => {
    render(<Badge>Badge Text</Badge>);
    expect(screen.getByText('Badge Text')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-white', 'text-gray-900');
  });

  it('applies secondary variant styles', () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-900');
  });

  it('applies destructive variant styles', () => {
    const { container } = render(<Badge variant="destructive">Destructive</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-red-500', 'text-white');
  });

  it('applies outline variant styles', () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('text-gray-900');
  });

  it('applies success variant styles', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-green-500', 'text-white');
  });

  it('applies warning variant styles', () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-orange-500', 'text-white');
  });

  it('applies pending variant styles', () => {
    const { container } = render(<Badge variant="pending">Pending</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-orange-500', 'text-white');
  });

  it('applies info variant styles', () => {
    const { container } = render(<Badge variant="info">Info</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-blue-500', 'text-white');
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-badge">Custom</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('custom-badge');
  });
});

