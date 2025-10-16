import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';

describe('Dialog Components', () => {
  it('renders Dialog component', () => {
    render(
      <Dialog open>
        <DialogContent>Dialog Content</DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Dialog Content')).toBeInTheDocument();
  });

  it('renders DialogContent', () => {
    render(
      <Dialog open>
        <DialogContent data-testid="content">Content</DialogContent>
      </Dialog>
    );
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('renders DialogHeader', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader data-testid="header">Header</DialogHeader>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders DialogTitle', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
  });

  it('renders DialogDescription', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Dialog Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Dialog Description')).toBeInTheDocument();
  });

  it('renders DialogTrigger', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>Content</DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Open Dialog')).toBeInTheDocument();
  });

  it('renders complete dialog structure', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
          </DialogHeader>
          <div>Dialog Body</div>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Dialog Body')).toBeInTheDocument();
  });

  it('applies custom className to DialogContent', () => {
    render(
      <Dialog open>
        <DialogContent className="custom-dialog" data-testid="content">
          Content
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByTestId('content')).toHaveClass('custom-dialog');
  });
});
