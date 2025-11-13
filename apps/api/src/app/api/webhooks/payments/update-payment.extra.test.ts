/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { createPayment } from './create-payment';
import { createClient, createAdminClient } from '@/lib/supabase/server';
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
  createAdminClient: jest.fn(),
}));

const mockSupabase: any = {
  from: jest.fn(() => mockSupabase),
  insert: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  maybeSingle: jest.fn(() => mockSupabase),
  single: jest.fn(),
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);
(createAdminClient as jest.Mock).mockReturnValue(mockSupabase);

describe('Create Payment - Extra Coverage', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = new NextRequest('http://localhost/api/webhooks/payments', { method: 'POST' });
  });

  it('creates payment with ARS currency', async () => {
    mockSupabase.single.mockResolvedValue({ 
      data: { id: 'p1', res_id: 'r1', amount: 100, currency: 'ARS' }, 
      error: null 
    });

    const result = await createPayment(mockRequest, 'r1', 100, 'ARS');
    expect(result.currency).toBe('ARS');
  });

  it('creates payment with USD currency', async () => {
    mockSupabase.single.mockResolvedValue({ 
      data: { id: 'p2', res_id: 'r2', amount: 200, currency: 'USD' }, 
      error: null 
    });

    const result = await createPayment(mockRequest, 'r2', 200, 'USD');
    expect(result.currency).toBe('USD');
  });

  it('creates payment with user_id', async () => {
    mockSupabase.single.mockResolvedValue({ 
      data: { id: 'p3', res_id: 'r3', amount: 300, user_id: 'u1' }, 
      error: null 
    });

    const result = await createPayment(mockRequest, 'r3', 300, undefined, 'u1');
    expect(result.user_id).toBe('u1');
  });

  it('creates payment with meta', async () => {
    const meta = { key: 'value' };
    mockSupabase.single.mockResolvedValue({ 
      data: { id: 'p4', res_id: 'r4', amount: 400, meta }, 
      error: null 
    });

    const result = await createPayment(mockRequest, 'r4', 400, undefined, undefined, meta);
    expect(result.meta).toEqual(meta);
  });

  it('creates payment with large amount', async () => {
    mockSupabase.single.mockResolvedValue({ 
      data: { id: 'p5', res_id: 'r5', amount: 999999 }, 
      error: null 
    });

    const result = await createPayment(mockRequest, 'r5', 999999);
    expect(result.amount).toBe(999999);
  });
});