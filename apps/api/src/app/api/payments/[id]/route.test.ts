import { NextRequest } from 'next/server';
import { GET, OPTIONS } from './route';

const mockSupabase = {
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  single: jest.fn(),
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

jest.mock('@/lib/cors', () => ({
  createCorsResponse: jest.fn((req, data, status = 200) => 
    new Response(JSON.stringify(data), { status })
  ),
  createCorsOptionsResponse: jest.fn(() => 
    new Response(null, { status: 204 })
  ),
}));

describe('payments/[id] route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('OPTIONS returns 204', async () => {
    const req = new NextRequest('http://localhost/api/payments/123', { 
      method: 'OPTIONS' 
    });
    const res = await OPTIONS(req);
    
    expect(res.status).toBe(204);
  });
});

