import React from 'react';
import { render, screen } from '@testing-library/react';
import { Alert, AlertDescription, AlertTitle } from '../alert';

describe('Alert Components', () => {
  it('renders Alert component', () => {
    render(<Alert data-testid="alert">Alert Content</Alert>);
    expect(screen.getByTestId('alert')).toBeInTheDocument();
  });

  it('renders AlertTitle', () => {
    render(<AlertTitle>Alert Title</AlertTitle>);
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
  });

  it('renders AlertDescription', () => {
    render(<AlertDescription>Alert Description</AlertDescription>);
    expect(screen.getByText('Alert Description')).toBeInTheDocument();
  });

  it('applies default variant', () => {
    const { container } = render(<Alert data-testid="alert">Default</Alert>);
    const alert = screen.getByTestId('alert');
    expect(alert).toHaveClass('bg-background');
  });

  it('applies destructive variant', () => {
    const { container } = render(<Alert variant="destructive" data-testid="alert">Error</Alert>);
    const alert = screen.getByTestId('alert');
    expect(alert).toHaveClass('bg-gray-900', 'text-white');
  });

  it('renders complete alert structure', () => {
    render(
      <Alert data-testid="alert">
        <AlertTitle>Error Title</AlertTitle>
        <AlertDescription>Error Description</AlertDescription>
      </Alert>
    );

    expect(screen.getByTestId('alert')).toBeInTheDocument();
    expect(screen.getByText('Error Title')).toBeInTheDocument();
    expect(screen.getByText('Error Description')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Alert className="custom-alert" data-testid="alert">Custom</Alert>);
    expect(screen.getByTestId('alert')).toHaveClass('custom-alert');
  });
});

