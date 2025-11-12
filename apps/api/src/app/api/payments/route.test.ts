import { NextRequest } from 'next/server';
import { GET, OPTIONS } from './route';

const mockSupabase = {
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
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

jest.mock('../middleware/adminAuth', () => ({
  adminAuthMiddleware: jest.fn(() => null),
}));

describe('payments route (get-all)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET returns all payments', async () => {
    mockSupabase.select.mockResolvedValue({
      data: [
        { id: '1', amount: 100 },
        { id: '2', amount: 200 },
      ],
      error: null,
    });

    const req = new NextRequest('http://localhost/api/payments');
    const res = await GET(req);
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.payments).toBeDefined();
  });

  it('GET returns 500 on database error', async () => {
    mockSupabase.select.mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    const req = new NextRequest('http://localhost/api/payments');
    const res = await GET(req);
    
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('OPTIONS returns 204', async () => {
    const req = new NextRequest('http://localhost/api/payments', { 
      method: 'OPTIONS' 
    });
    const res = await OPTIONS(req);
    
    expect(res.status).toBe(204);
  });
});
