/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { updatePaymentByReservationId } from './update-payment';

jest.mock('@/lib/supabase/server', () => {
  const mockClient: any = {};
  mockClient.from = jest.fn(() => mockClient);
  mockClient.select = jest.fn(() => mockClient);
  mockClient.update = jest.fn(() => mockClient);
  mockClient.eq = jest.fn(() => mockClient);
  
  // Mockeamos la respuesta de la lógica de 2 pasos (update + select)
  // El .update() no devuelve nada
  mockClient.update = jest.fn(() => ({ data: null, error: null })); 
  // El .maybeSingle() (el select) devuelve el pago
  mockClient.maybeSingle = jest.fn(() => ({ 
    data: { 
      id: '1', 
      status: (mockClient as any).lastUpdatePayload?.status || 'PENDING', // Devuelve el status que se actualizó
      res_id: 'res-1',
      user_id: 'user-1',
      amount: 100,
      currency: 'ARS',
      meta: {},
      created_at: new Date().toISOString()
    }, 
    error: null 
  }));
  // Guardamos el payload del update para testear
  mockClient.update = jest.fn((payload: any) => {
    (mockClient as any).lastUpdatePayload = payload;
    return mockClient;
  });


  return {
    createClient: jest.fn(() => mockClient),
    createAdminClient: jest.fn(() => mockClient),
  };
});

describe('updatePayment', () => {
  it('updates payment status', async () => {
    // ELIMINAMOS 'req'
    const payment = await updatePaymentByReservationId('1', 'SUCCESS');
    expect(payment).not.toBeNull();
    expect(payment!.status).toBe('SUCCESS');
  });

  it('updates payment to FAILURE', async () => {
    // ELIMINAMOS 'req'
    const payment = await updatePaymentByReservationId('1', 'FAILURE');
    expect(payment).not.toBeNull();
    expect(payment).toHaveProperty('id');
    expect(payment!.status).toBe('FAILURE');
  });
});