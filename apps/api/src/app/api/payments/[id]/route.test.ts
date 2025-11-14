/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { GET, OPTIONS } from './route';

const mockSupabase: any = {
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  single: jest.fn(),
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabase),
  createAdminClient: jest.fn(() => mockSupabase),
}));

jest.mock('@/lib/cors', () => ({
  createCorsResponse: jest.fn((req, data, status = 200) => 
    new Response(JSON.stringify(data), { status })
  ),
  createCorsOptionsResponse: jest.fn(() => 
    new Response(null, { status: 204 })
  ),
}));

const mockGetPaymentSchema = {
  safeParse: jest.fn((data: { id: string }) => ({
    success: data?.id ? true : false,
    data: data?.id ? data : undefined,
    error: data?.id ? undefined : { message: 'Invalid id' }
  }))
};

jest.mock('./get-payment', () => ({
  getPayment: jest.fn(),
  getPaymentSchema: mockGetPaymentSchema
}));

describe('payments/[id] route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock to default behavior
    mockGetPaymentSchema.safeParse.mockImplementation((data: { id: string }) => ({
      success: data?.id ? true : false,
      data: data?.id ? data : undefined,
      error: data?.id ? undefined : { message: 'Invalid id' }
    }));
  });

  it('GET returns payment by id', async () => {
    mockSupabase.single.mockResolvedValue({
      data: { id: '123', amount: 100, status: 'PENDING' },
      error: null,
    });

    const req = new NextRequest('http://localhost/api/payments/123');
    const res = await GET(req, { params: Promise.resolve({ id: '123' }) });
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.payment).toBeDefined();
  });

  it('GET returns 500 on database error', async () => {
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    const req = new NextRequest('http://localhost/api/payments/123');
    const res = await GET(req, { params: Promise.resolve({ id: '123' }) });
    
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('GET returns 400 on invalid id format', async () => {
    // Mock getPaymentSchema to fail validation
    mockGetPaymentSchema.safeParse.mockReturnValueOnce({
      success: false,
      error: { message: 'Invalid id' }
    });

    const req = new NextRequest('http://localhost/api/payments/');
    const res = await GET(req, { params: Promise.resolve({ id: 'invalid' }) });
    
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('Invalid request body');
  });

  it('GET handles general errors', async () => {
    mockSupabase.single.mockRejectedValueOnce(new Error('Unexpected error'));

    const req = new NextRequest('http://localhost/api/payments/123');
    const res = await GET(req, { params: Promise.resolve({ id: '123' }) });
    
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('OPTIONS returns 204', async () => {
    const req = new NextRequest('http://localhost/api/payments/123', { 
      method: 'OPTIONS' 
    });
    const res = await OPTIONS(req);
    
    expect(res.status).toBe(204);
  });
});

