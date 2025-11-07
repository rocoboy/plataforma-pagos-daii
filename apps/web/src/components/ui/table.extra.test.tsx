import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table';

describe('Table - Extra Coverage', () => {
  it('renders with TableFooter', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Footer</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('renders with TableCaption', () => {
    render(
      <Table>
        <TableCaption>Table Caption</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText('Table Caption')).toBeInTheDocument();
  });

  it('renders multiple rows', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Col1</TableHead>
            <TableHead>Col2</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>A1</TableCell>
            <TableCell>A2</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>B1</TableCell>
            <TableCell>B2</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('B2')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(
      <Table className="custom-table">
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByText('Cell')).toBeInTheDocument();
  });

  it('handles empty table body', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody></TableBody>
      </Table>
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
  });
});

