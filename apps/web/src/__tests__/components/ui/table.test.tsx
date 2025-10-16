import React from 'react';
import { render, screen } from '@testing-library/react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../../components/ui/table';

describe('Table Components', () => {
  it('renders Table component', () => {
    render(<Table data-testid="table">Table Content</Table>);
    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('renders TableHeader', () => {
    render(<TableHeader data-testid="header">Header Content</TableHeader>);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders TableBody', () => {
    render(<TableBody data-testid="body">Body Content</TableBody>);
    expect(screen.getByTestId('body')).toBeInTheDocument();
  });

  it('renders TableRow', () => {
    render(<TableRow data-testid="row">Row Content</TableRow>);
    expect(screen.getByTestId('row')).toBeInTheDocument();
  });

  it('renders TableHead', () => {
    render(<TableHead>Header Cell</TableHead>);
    expect(screen.getByText('Header Cell')).toBeInTheDocument();
  });

  it('renders TableCell', () => {
    render(<TableCell>Cell Content</TableCell>);
    expect(screen.getByText('Cell Content')).toBeInTheDocument();
  });

  it('renders complete table structure', () => {
    render(
      <Table data-testid="table">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John</TableCell>
            <TableCell>30</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane</TableCell>
            <TableCell>25</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByTestId('table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('applies custom className to Table', () => {
    render(<Table className="custom-table" data-testid="table">Content</Table>);
    expect(screen.getByTestId('table')).toHaveClass('custom-table');
  });
});
