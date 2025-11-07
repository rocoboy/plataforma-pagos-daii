import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from './table';

describe('Table', () => {
  it('renders with default visually hidden header when none provided', () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>A</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('renders custom header when provided', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Col1</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>A</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText('Col1')).toBeInTheDocument();
  });
});
