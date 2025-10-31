import { NextRequest } from 'next/server';
import { GET, OPTIONS } from './route';

jest.mock('./get-all-payments', () => ({
  getAllPayments: jest.fn(async () => [{ id: '1', amount: 10 }])
}));

jest.mock('../middleware/adminAuth', () => ({
  adminAuthMiddleware: jest.fn(() => null)
}));

jest.mock('@/lib/cors', () => ({
  createCorsResponse: jest.fn((req, data, status = 200) => new Response(JSON.stringify(data), { status })),
  createCorsOptionsResponse: jest.fn(() => new Response(null, { status: 204 }))
}));

describe('payments route', () => {
  it('GET returns payments when auth passes', async () => {
    const req = new NextRequest('http://localhost/api/payments');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.payments).toHaveLength(1);
  });

  it('OPTIONS returns 204', async () => {
    const req = new NextRequest('http://localhost/api/payments', { method: 'OPTIONS' });
    const res = await OPTIONS(req);
    expect(res.status).toBe(204);
  });
});

