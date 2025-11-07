import React from 'react';
import { render, screen } from '@testing-library/react';
import { Alert, AlertDescription, AlertTitle } from './alert';

describe('Alert', () => {
  it('renders title and description', () => {
    render(
      <Alert>
        <AlertTitle>Title</AlertTitle>
        <AlertDescription>Desc</AlertDescription>
      </Alert>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
  });
});
