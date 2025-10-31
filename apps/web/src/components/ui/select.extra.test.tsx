import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select';

describe('Select - Extra Coverage', () => {
  it('renders SelectScrollUpButton', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectScrollUpButton />
          <SelectItem value="1">Item 1</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByText('Select')).toBeInTheDocument();
  });

  it('renders SelectScrollDownButton', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Item 1</SelectItem>
          <SelectScrollDownButton />
        </SelectContent>
      </Select>
    );
    expect(screen.getByText('Select')).toBeInTheDocument();
  });

  it('renders SelectSeparator', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Item 1</SelectItem>
          <SelectSeparator />
          <SelectItem value="2">Item 2</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByText('Select')).toBeInTheDocument();
  });

  it('renders with SelectGroup and SelectLabel', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Group Label</SelectLabel>
            <SelectItem value="1">Item 1</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
    expect(screen.getByText('Select')).toBeInTheDocument();
  });

  it('renders multiple items', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Option A</SelectItem>
          <SelectItem value="b">Option B</SelectItem>
          <SelectItem value="c">Option C</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByText('Choose')).toBeInTheDocument();
  });
});

