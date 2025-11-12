import { NextRequest } from 'next/server';
import { updatePaymentByReservationId } from './update-payment';

let capturedStatus = 'SUCCESS';

const mockUpdate = jest.fn((updateData: { status?: string }) => {
  if (updateData?.status) {
    capturedStatus = updateData.status;
  }
  return {
    eq: jest.fn(() => ({
      error: null
    }))
  };
});

const mockMaybeSingle = jest.fn(() => ({
  data: { 
    id: '1', 
    res_id: 'res1', 
    amount: 100, 
    status: capturedStatus,
    currency: 'ARS', 
    created_at: new Date().toISOString() 
  },
  error: null
}));

jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn(() => ({
      update: mockUpdate,
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: mockMaybeSingle
        }))
      }))
    }))
  }))
}));

describe('updatePayment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedStatus = 'SUCCESS';
  });

  it('updates payment status', async () => {
    const req = new NextRequest('http://localhost/api/webhooks/payments');
    const payment = await updatePaymentByReservationId(req, '1', 'SUCCESS');
    expect(payment).not.toBeNull();
    expect(payment!.status).toBe('SUCCESS');
  });

  it('updates payment to FAILURE', async () => {
    const req = new NextRequest('http://localhost/api/webhooks/payments');
  const payment = await updatePaymentByReservationId(req, '1', 'FAILURE');
  expect(payment).not.toBeNull();
  expect(payment).toHaveProperty('id');
  });
});

