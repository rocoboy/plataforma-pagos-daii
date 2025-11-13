/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { createPayment } from './create-payment';
import { createClient, createAdminClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server', () => {
  const mockClient: any = {};
  mockClient.from = jest.fn(() => mockClient);
  mockClient.insert = jest.fn(() => mockClient);
  mockClient.select = jest.fn(() => mockClient);
  mockClient.eq = jest.fn(() => mockClient);
  // Mock 'maybeSingle' para simular que el pago NO existe
  mockClient.maybeSingle = jest.fn(() => ({ data: null, error: null })); 
  
  // Mock 'single' para la respuesta de la inserción
  mockClient.single = jest.fn((...args: any[]) => ({ 
    data: { 
      id: 'mock-id', 
      res_id: 'mock-res-id', 
      amount: 100, 
      status: 'PENDING', 
      // Devolvemos la moneda que se pasó
      currency: (mockClient as any).lastInsertPayload?.currency || 'ARS', 
      user_id: 'mock-user-id',
      meta: {},
      created_at: new Date().toISOString()
    }, 
    error: null 
  }));
  
  // Guardamos el payload del insert para testear
  mockClient.insert = jest.fn((payload: any) => {
    (mockClient as any).lastInsertPayload = payload;
    return mockClient;
  });

  (createClient as jest.Mock).mockReturnValue(mockClient);
  (createAdminClient as jest.Mock).mockReturnValue(mockClient);
  return { createClient, createAdminClient };
});

describe('Create Payment - Extra Coverage', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates payment with ARS currency', async () => {
    // ELIMINAMOS 'mockRequest'
    const result = await createPayment('r1', 100, 'ARS');
    // Leemos la respuesta anidada
    expect(result.payment.currency).toBe('ARS');
  });

  it('creates payment with USD currency', async () => {
    // ELIMINAMOS 'mockRequest'
    const result = await createPayment('r2', 200, 'USD');
    // Leemos la respuesta anidada y CORREGIMOS EL TEST (debe ser USD)
    expect(result.payment.currency).toBe('USD'); 
  });

  it('creates payment with user_id', async () => {
    // ELIMINAMOS 'mockRequest'
    const result = await createPayment('r3', 300, undefined, 'u1');
    expect(result.payment).toHaveProperty('id');
  });

  it('creates payment with meta', async () => {
    const meta = { key: 'value' };
    // ELIMINAMOS 'mockRequest'
    const result = await createPayment('r4', 400, undefined, undefined, meta);
    expect(result.payment).toHaveProperty('id');
  });

  it('creates payment with large amount', async () => {
    // ELIMINAMOS 'mockRequest'
    const result = await createPayment('r5', 999999);
    expect(result.payment).toHaveProperty('id');
    expect(result.payment.amount).toBe(999999);
  });
});