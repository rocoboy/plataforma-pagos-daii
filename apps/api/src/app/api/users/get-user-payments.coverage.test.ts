import { NextRequest } from 'next/server';
import { getUserPayments } from './get-user-payments';

const mockSupabase = {
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe('Get User Payments - Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns payments for user', async () => {
    mockSupabase.eq.mockResolvedValue({
      data: [{ id: '1', amount: 100, user_id: 'user1' }],
      error: null,
    });

    const req = new NextRequest('http://localhost/api/users');
    const payments = await getUserPayments(req, 'user1');
    
    expect(payments).toEqual([{ id: '1', amount: 100, user_id: 'user1' }]);
    expect(mockSupabase.from).toHaveBeenCalledWith('payments');
    expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user1');
  });

  it('throws error on database error', async () => {
    mockSupabase.eq.mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    const req = new NextRequest('http://localhost/api/users');
    
    await expect(getUserPayments(req, 'user1')).rejects.toThrow('Database error');
  });
});

