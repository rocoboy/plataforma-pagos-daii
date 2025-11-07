import { NextRequest } from 'next/server';
import { getAllPayments } from './get-all-payments';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        data: [{ id: '1', amount: 100 }],
        error: null
      }))
    }))
  }))
}));

describe('getAllPayments', () => {
  it('returns payments from database', async () => {
    const req = new NextRequest('http://localhost/api/payments');
    const payments = await getAllPayments(req);
    expect(payments).toEqual([{ id: '1', amount: 100 }]);
  });
});

