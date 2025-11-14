import { NextRequest } from 'next/server';
import { GET } from './route';

const mockSupabase = {
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
};

jest.mock('@/lib/supabase/server', () => ({
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

const mockAdminAuthMiddleware = jest.fn();

jest.mock('../middleware/adminAuth', () => ({
  adminAuthMiddleware: (...args: unknown[]) => mockAdminAuthMiddleware(...args),
}));

describe('payments route - Extra Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAdminAuthMiddleware.mockReturnValue(null);
  });

  it('GET returns 401 when auth fails', async () => {
    mockAdminAuthMiddleware.mockReturnValue(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    );

    const req = new NextRequest('http://localhost/api/payments');
    const res = await GET(req);
    
    expect(res.status).toBe(401);
    expect(mockSupabase.select).not.toHaveBeenCalled();
  });
});

