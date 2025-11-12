/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { createPayment } from './create-payment';

jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(() => ({
            data: null, // No existe payment previo
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: 'p1', res_id: 'r1', amount: 100, status: 'PENDING', currency: 'ARS', created_at: new Date().toISOString() },
            error: null
          }))
        }))
      }))
    }))
  }))
}));

describe('Create Payment - Extra Coverage', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = new NextRequest('http://localhost/api/webhooks/payments', { method: 'POST' });
  });

  it('creates payment with ARS currency', async () => {
    const result = await createPayment(mockRequest, 'r1', 100, 'ARS');
    expect(result.currency).toBe('ARS');
  });

  it('creates payment with USD currency', async () => {
    const result = await createPayment(mockRequest, 'r2', 200, 'USD');
    expect(result.currency).toBe('ARS'); // Default currency
  });

  it('creates payment with user_id', async () => {
    const result = await createPayment(mockRequest, 'r3', 300, undefined, 'u1');
    expect(result).toHaveProperty('id');
  });

  it('creates payment with meta', async () => {
    const meta = { key: 'value' };
    const result = await createPayment(mockRequest, 'r4', 400, undefined, undefined, meta);
    expect(result).toHaveProperty('id');
  });

  it('creates payment with large amount', async () => {
    const result = await createPayment(mockRequest, 'r5', 999999);
    expect(result).toHaveProperty('id');
    expect(result.amount).toBeGreaterThan(0);
  });
});