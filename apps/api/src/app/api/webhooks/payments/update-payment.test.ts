/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { updatePaymentByReservationId } from './update-payment';

jest.mock('@/lib/supabase/server', () => {
  const createMockClient = () => {
    const updateChainClient: any = {
      eq: jest.fn(() => Promise.resolve({ error: null }))
    };

    const selectChainClient: any = {
      eq: jest.fn(() => selectChainClient),
      maybeSingle: jest.fn(() => Promise.resolve({ 
        data: { 
          id: '1',
          status: 'SUCCESS',
          res_id: '1',
          user_id: 'user-1',
          amount: 100,
          currency: 'ARS',
          meta: {},
          created_at: new Date().toISOString()
        },
        error: null
      }))
    };

    const mockClient: any = {
      from: jest.fn(() => mockClient),
      select: jest.fn(() => selectChainClient),
      update: jest.fn(() => updateChainClient),
    };
    
    return mockClient;
  };

  return {
    createClient: jest.fn(() => createMockClient()),
    createAdminClient: jest.fn(() => createMockClient()),
  };
});

describe('updatePayment', () => {
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates payment status', async () => {
    const payment = await updatePaymentByReservationId('1', 'SUCCESS');
    expect(payment).not.toBeNull();
    expect(payment!.status).toBe('SUCCESS');
  });

  it('throws error when update fails', async () => {
    const { createAdminClient } = require('@/lib/supabase/server');
    const updateChain = {
      eq: jest.fn(() => Promise.resolve({ error: { message: 'Update error' } }))
    };
    const selectChain = {
      eq: jest.fn(() => selectChain),
      maybeSingle: jest.fn()
    };
    const mockErrorClient = {
      from: jest.fn(() => mockErrorClient),
      select: jest.fn(() => selectChain),
      update: jest.fn(() => updateChain),
    };
    jest.spyOn(require('@/lib/supabase/server'), 'createAdminClient').mockReturnValueOnce(mockErrorClient);

    await expect(updatePaymentByReservationId('1', 'SUCCESS')).rejects.toThrow('Update error');
  });

  it('throws error when select fails', async () => {
    const { createAdminClient } = require('@/lib/supabase/server');
    const updateChain = {
      eq: jest.fn(() => Promise.resolve({ error: null }))
    };
    const selectChain = {
      eq: jest.fn(() => selectChain),
      maybeSingle: jest.fn(() => Promise.resolve({
        data: null,
        error: { message: 'Select error' }
      }))
    };
    const mockErrorClient = {
      from: jest.fn(() => mockErrorClient),
      select: jest.fn(() => selectChain),
      update: jest.fn(() => updateChain),
    };
    jest.spyOn(require('@/lib/supabase/server'), 'createAdminClient').mockReturnValueOnce(mockErrorClient);

    await expect(updatePaymentByReservationId('1', 'SUCCESS')).rejects.toThrow('Select error');
  });

  it('returns null when payment not found', async () => {
    const { createAdminClient } = require('@/lib/supabase/server');
    const updateChain = {
      eq: jest.fn(() => Promise.resolve({ error: null }))
    };
    const selectChain = {
      eq: jest.fn(() => selectChain),
      maybeSingle: jest.fn(() => Promise.resolve({
        data: null,
        error: null
      }))
    };
    const mockNullClient = {
      from: jest.fn(() => mockNullClient),
      select: jest.fn(() => selectChain),
      update: jest.fn(() => updateChain),
    };
    jest.spyOn(require('@/lib/supabase/server'), 'createAdminClient').mockReturnValueOnce(mockNullClient);

    const result = await updatePaymentByReservationId('1', 'SUCCESS');
    expect(result).toBeNull();
  });
});