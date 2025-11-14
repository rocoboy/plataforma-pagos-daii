/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { createPayment } from './create-payment';

// Mock del cliente admin (el mock de 'single' debe devolver el objeto 'data' completo)
jest.mock('@/lib/supabase/server', () => {
  const mockClient: any = {};
  mockClient.from = jest.fn(() => mockClient);
  mockClient.select = jest.fn(() => mockClient);
  mockClient.insert = jest.fn(() => mockClient);
  mockClient.update = jest.fn(() => mockClient);
  mockClient.eq = jest.fn(() => mockClient);
  mockClient.single = jest.fn(() => ({ 
    data: { 
      id: '1', 
      res_id: 'res1', 
      amount: 100, 
      status: 'PENDING', 
      currency: 'ARS', 
      user_id: 'user1',
      meta: {},
      created_at: new Date().toISOString() 
    }, 
    error: null 
  }));
  mockClient.maybeSingle = jest.fn(() => ({ data: null, error: null })); // Simula que el pago NO existe

  return {
    createClient: jest.fn(() => mockClient),
    createAdminClient: jest.fn(() => mockClient),
  };
});

describe('createPayment', () => {
  it('creates payment with default values', async () => {
    // ELIMINAMOS 'req' de la llamada
    const payment = await createPayment('res1', 100);
    // Revisamos la respuesta anidada
    expect(payment.payment).toHaveProperty('id');
    expect(payment.payment.res_id).toBe('res1');
    expect(payment.isNew).toBe(true); // Verifica que es nuevo
  });

  it('creates payment with user_id', async () => {
    // ELIMINAMOS 'req'
    const payment = await createPayment('res1', 100, 'USD', 'user1');
    expect(payment.payment).toHaveProperty('id');
  });

  it('creates payment with metadata', async () => {
    // ELIMINAMOS 'req'
    const payment = await createPayment('res1', 100, 'ARS', 'user1', { extra: 'data' });
    expect(payment.payment).toHaveProperty('id');
  });
});