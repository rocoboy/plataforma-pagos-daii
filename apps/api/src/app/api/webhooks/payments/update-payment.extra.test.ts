/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { updatePaymentByReservationId } from './update-payment';
import { createClient, createAdminClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => {
  let storedStatus: string = 'PENDING';
  let storedResId: string = 'p-default';

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

describe('Update Payment - Extra Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates to SUCCESS status', async () => {
    const result = await updatePaymentByReservationId('p1', 'SUCCESS');
    expect(result).not.toBeNull();
    expect(result!.status).toBe('SUCCESS');
  });

});