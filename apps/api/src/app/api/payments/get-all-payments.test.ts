import { NextRequest } from 'next/server';
import { getAllPayments } from './get-all-payments';

jest.mock('@/lib/supabase/server', () => {
  const mockFrom = jest.fn(() => ({ select: jest.fn(() => ({ data: [{ id: '1', amount: 100 }], error: null })), single: jest.fn(), maybeSingle: jest.fn() }));
  const client = { from: mockFrom };
  return {
    createClient: jest.fn(() => client),
    createAdminClient: jest.fn(() => client),
  };
});

describe('getAllPayments', () => {
  it('returns payments from database', async () => {
    const req = new NextRequest('http://localhost/api/payments');
    const payments = await getAllPayments(req);
    expect(payments).toEqual([{ id: '1', amount: 100 }]);
  });
});

