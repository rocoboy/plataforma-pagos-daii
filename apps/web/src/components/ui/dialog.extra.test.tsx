import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';

describe('Dialog - Extra Coverage', () => {
  it('renders DialogPortal', () => {
    render(
      <Dialog open={true}>
        <DialogPortal>
          <DialogContent>
            <DialogTitle>Test</DialogTitle>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('renders DialogHeader', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Header Test</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Header Test')).toBeInTheDocument();
  });

  it('renders DialogFooter', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Test</DialogTitle>
          <DialogFooter>
            <div>Footer Content</div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('renders DialogDescription', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Test</DialogTitle>
          <DialogDescription>Description text</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(
      <Dialog open={true}>
        <DialogContent className="custom-class">
          <DialogTitle>Test</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});

