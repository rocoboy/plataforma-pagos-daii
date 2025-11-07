import { NextRequest } from 'next/server';
import { updatePayment } from './update-payment';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: { id: '1', status: 'SUCCESS' },
              error: null
            }))
          }))
        }))
      }))
    }))
  }))
}));

describe('updatePayment', () => {
  it('updates payment status', async () => {
    const req = new NextRequest('http://localhost/api/webhooks/payments');
    const payment = await updatePayment(req, '1', 'SUCCESS');
    expect(payment.status).toBe('SUCCESS');
  });

  it('updates payment to FAILURE', async () => {
    const req = new NextRequest('http://localhost/api/webhooks/payments');
    const payment = await updatePayment(req, '1', 'FAILURE');
    expect(payment).toHaveProperty('id');
  });
});

