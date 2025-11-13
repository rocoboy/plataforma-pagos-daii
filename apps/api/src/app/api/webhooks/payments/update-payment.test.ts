/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { updatePaymentByReservationId } from './update-payment';

jest.mock('@/lib/supabase/server', () => {
  const mockClient: any = {};
  mockClient.from = jest.fn(() => mockClient);
  mockClient.select = jest.fn(() => mockClient);
  mockClient.update = jest.fn(() => mockClient);
  mockClient.eq = jest.fn(() => mockClient);
  mockClient.single = jest.fn(() => ({ data: { id: '1', status: 'SUCCESS' }, error: null }));
  mockClient.maybeSingle = jest.fn(() => ({ data: { id: '1', status: 'SUCCESS' }, error: null }));

  return {
    createClient: jest.fn(() => mockClient),
    createAdminClient: jest.fn(() => mockClient),
  };
});

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

