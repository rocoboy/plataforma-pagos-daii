/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { updatePaymentByReservationId } from './update-payment';
import { createClient, createAdminClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => {
  const mockClient: any = {};
  mockClient.from = jest.fn(() => mockClient);
  mockClient.update = jest.fn(() => mockClient);
  mockClient.eq = jest.fn(() => mockClient);
  mockClient.select = jest.fn(() => mockClient);
  mockClient.single = jest.fn();
  
  // Mockeamos la respuesta de la lógica de 2 pasos
  mockClient.update = jest.fn(() => ({ data: null, error: null }));
  mockClient.maybeSingle = jest.fn(() => ({ 
    data: { 
      id: (mockClient as any).lastEqPayload || 'p-default', 
      status: (mockClient as any).lastUpdatePayload?.status || 'PENDING',
      res_id: (mockClient as any).lastEqPayload || 'p-default',
      user_id: 'user-1',
      amount: 100,
      currency: 'ARS',
      meta: {},
      created_at: new Date().toISOString()
    }, 
    error: null 
  }));

  // Guardamos los payloads para testear
  mockClient.update = jest.fn((payload: any) => {
    (mockClient as any).lastUpdatePayload = payload;
    return mockClient;
  });
  mockClient.eq = jest.fn((field: string, value: string) => {
    (mockClient as any).lastEqPayload = value;
    return mockClient;
  });


  (createClient as jest.Mock).mockReturnValue(mockClient);
  (createAdminClient as jest.Mock).mockReturnValue(mockClient);
  return { createClient, createAdminClient };
});

describe('Update Payment - Extra Coverage', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates to SUCCESS status', async () => {
    // ELIMINAMOS 'mockRequest'
    const result = await updatePaymentByReservationId('p1', 'SUCCESS');
    expect(result).not.toBeNull();
    expect(result!.status).toBe('SUCCESS');
  });

  it('updates to FAILURE status', async () => {
    // ELIMINAMOS 'mockRequest'
    const result = await updatePaymentByReservationId('p2', 'FAILURE');
    expect(result).not.toBeNull();
    expect(result!.status).toBe('FAILURE');
  });
  
  // ... (puedes agregar el resto de los estados) ...

  it('handles different payment ids', async () => {
    // ELIMINAMOS 'mockRequest'
    const result = await updatePaymentByReservationId('custom-id-123', 'SUCCESS');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('custom-id-123');
  });
});