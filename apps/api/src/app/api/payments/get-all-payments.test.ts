import { getAllPayments } from './get-all-payments';

jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: jest.fn(() => ({
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
    const payments = await getAllPayments();
    expect(payments).toEqual([{ id: '1', amount: 100 }]);
  });
});

