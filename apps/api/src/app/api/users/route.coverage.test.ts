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
  const mockSafeParseFn = jest.fn((data: any) => {
    if (data && data.user_id) {
      return { success: true, data };
    }
    return { success: false, error: { message: 'Invalid user_id' } };
  });
  
  // Store reference for use in tests
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
  mockGetUserPayments = (global as any).__mockGetUserPaymentsForRoute;
});

describe('Users Route - Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('OPTIONS returns 204', async () => {
    const req = new NextRequest('http://localhost/api/users', { 
      method: 'OPTIONS' 
    });
    const res = await OPTIONS(req);
    
    expect(res.status).toBe(204);
  });
});

