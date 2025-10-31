import { NextRequest } from 'next/server';
import { createPayment } from './create-payment';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: { id: '1', res_id: 'res1', amount: 100, status: 'PENDING', currency: 'ARS' },
            error: null
          }))
        }))
      }))
    }))
  }))
}));

describe('createPayment', () => {
  it('creates payment with default values', async () => {
    const req = new NextRequest('http://localhost/api/webhooks/payments');
    const payment = await createPayment(req, 'res1', 100);
    expect(payment).toHaveProperty('id');
    expect(payment.res_id).toBe('res1');
  });

  it('creates payment with user_id', async () => {
    const req = new NextRequest('http://localhost/api/webhooks/payments');
    const payment = await createPayment(req, 'res1', 100, 'USD', 'user1');
    expect(payment).toHaveProperty('id');
  });

  it('creates payment with metadata', async () => {
    const req = new NextRequest('http://localhost/api/webhooks/payments');
    const payment = await createPayment(req, 'res1', 100, 'ARS', 'user1', { extra: 'data' });
    expect(payment).toHaveProperty('id');
  });
});

