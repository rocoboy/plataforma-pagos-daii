import { NextRequest } from 'next/server';
import { GET, OPTIONS } from './route';

const mockSupabase = {
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
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

// Define mock functions that will be accessible after jest.mock
let mockGetUserPayments: jest.Mock;

jest.mock('./get-user-payments', () => {
  const mockGetUserPaymentsFn = jest.fn(async () => [{ id: '1', amount: 100 }]);
  const mockSafeParseFn = jest.fn((data: unknown) => {
    if (data && typeof data === 'object' && 'user_id' in data) {
      return { success: true, data };
    }
    return { success: false, error: { message: 'Invalid user_id' } };
  });
  
  // Store reference for use in tests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).__mockGetUserPaymentsForRoute = mockGetUserPaymentsFn;
  
  return {
    getUserPayments: (...args: unknown[]) => mockGetUserPaymentsFn(...args),
    getUserPaymentsBodySchema: {
      safeParse: mockSafeParseFn
    }
  };
});

// Get reference after mock is set up
beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockGetUserPayments = (global as any).__mockGetUserPaymentsForRoute;
});

describe('Users Route - Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock to default behavior
    if (mockGetUserPayments) {
      mockGetUserPayments.mockResolvedValue([{ id: '1', amount: 100 }]);
    }
  });

  it('GET returns payments with valid body', async () => {
    // Since NextRequest doesn't allow body in GET, we'll mock request.json
    const bodyData = { user_id: 'user1' };
    const req = new NextRequest('http://localhost/api/users', { method: 'POST' });
    // Mock the json method to return the body data
    req.json = jest.fn().mockResolvedValue(bodyData);
    Object.defineProperty(req, 'method', { value: 'GET', writable: true, configurable: true });
    
    const res = await GET(req);
    
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.payments).toBeDefined();
  });

  it('GET returns 400 on invalid body', async () => {
    const bodyData = {};
    const req = new NextRequest('http://localhost/api/users', { method: 'POST' });
    req.json = jest.fn().mockResolvedValue(bodyData);
    Object.defineProperty(req, 'method', { value: 'GET', writable: true, configurable: true });
    
    const res = await GET(req);
    
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe('Invalid request body');
  });

  it('GET returns 500 on error', async () => {
    if (mockGetUserPayments) {
      mockGetUserPayments.mockRejectedValueOnce(new Error('Database error'));
    }

    const bodyData = { user_id: 'user1' };
    const req = new NextRequest('http://localhost/api/users', { method: 'POST' });
    req.json = jest.fn().mockResolvedValue(bodyData);
    Object.defineProperty(req, 'method', { value: 'GET', writable: true, configurable: true });
    
    const res = await GET(req);
    
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('OPTIONS returns 204', async () => {
    const req = new NextRequest('http://localhost/api/users', { 
      method: 'OPTIONS' 
    });
    const res = await OPTIONS(req);
    
    expect(res.status).toBe(204);
  });
});

