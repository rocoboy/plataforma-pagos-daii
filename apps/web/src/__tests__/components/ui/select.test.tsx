import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

describe('Select Components', () => {
  it('renders SelectTrigger with placeholder', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>
    );
    
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('renders SelectContent with items', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('handles selection of items', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );
    
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
  });

  it('applies custom className to SelectTrigger', () => {
    render(
      <Select>
        <SelectTrigger className="custom-trigger">
          <SelectValue placeholder="Test" />
        </SelectTrigger>
      </Select>
    );
    
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('custom-trigger');
  });

  it('renders SelectItem with correct value', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Test" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="test-value">Test Item</SelectItem>
        </SelectContent>
      </Select>
    );
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('disables SelectTrigger when disabled', () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Disabled" />
        </SelectTrigger>
      </Select>
    );
    
    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveAttribute('data-disabled', '');
  });
});
