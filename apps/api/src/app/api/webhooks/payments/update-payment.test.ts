/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { updatePaymentByReservationId } from './update-payment';

jest.mock('@/lib/supabase/server', () => {
  let storedStatus: string = 'PENDING';
  let storedResId: string = '1';

  const createMockClient = () => {
    const mockClient: any = {
      from: jest.fn(() => mockClient),
      select: jest.fn(() => mockClient),
      eq: jest.fn((field: string, value: string) => {
        if (field === 'res_id') {
          storedResId = value;
        }
        return mockClient;
      }),
      update: jest.fn((payload: any) => {
        storedStatus = payload?.status || storedStatus;
        return mockClient;
      }),
      maybeSingle: jest.fn(() => ({ 
        data: { 
          id: storedResId,
          status: storedStatus,
          res_id: storedResId,
          user_id: 'user-1',
          amount: 100,
          currency: 'ARS',
          meta: {},
          created_at: new Date().toISOString()
        }, 
        error: null 
      }))
    };
    return mockClient;
  };

  return {
    createClient: jest.fn(() => createMockClient()),
    createAdminClient: jest.fn(() => createMockClient()),
  };
});

describe('updatePayment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset stored values
    const { createAdminClient } = require('@/lib/supabase/server');
    const mock = createAdminClient();
    // Reset state by calling update with default
    mock.update({ status: 'PENDING' });
  });

  it('updates payment status', async () => {
    const payment = await updatePaymentByReservationId('1', 'SUCCESS');
    expect(payment).not.toBeNull();
    expect(payment!.status).toBe('SUCCESS');
  });

});