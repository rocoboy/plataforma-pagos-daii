import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('renders and accepts typing', () => {
    render(<Input placeholder="type here" />);
    const el = screen.getByPlaceholderText('type here') as HTMLInputElement;
    fireEvent.change(el, { target: { value: 'abc' } });
    expect(el.value).toBe('abc');
  });
});
