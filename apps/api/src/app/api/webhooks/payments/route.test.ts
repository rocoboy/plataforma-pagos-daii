import { NextRequest } from 'next/server';
import { POST, PUT, OPTIONS } from './route';

jest.mock('./create-payment', () => ({
  createPayment: jest.fn(async () => ({ id: '1', amount: 10 })),
  createPaymentBodySchema: {
    safeParse: jest.fn((data) => {
      if (data.res_id && data.user_id && data.amount && data.currency) {
        return { success: true, data };
      }
      return { success: false, error: { message: 'Invalid' } };
    })
  }
}));

jest.mock('./update-payment', () => ({
  updatePayment: jest.fn(async () => ({ id: '1', status: 'success' })),
  updatePaymentBodySchema: {
    safeParse: jest.fn((data) => {
      if (data.id && data.status) {
        return { success: true, data };
      }
      return { success: false, error: { message: 'Invalid' } };
    })
  }
}));

jest.mock('@/lib/cors', () => ({
  createCorsResponse: jest.fn((req, data, status = 200) => new Response(JSON.stringify(data), { status })),
  createCorsOptionsResponse: jest.fn(() => new Response(null, { status: 204 }))
}));

describe('webhooks/payments route', () => {
  it('POST creates payment with valid body', async () => {
    const req = new NextRequest('http://localhost/api/webhooks/payments', {
      method: 'POST',
      body: JSON.stringify({ res_id: 'R1', user_id: 'U1', amount: 10, currency: 'ARS' })
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('PUT updates payment with valid body', async () => {
    const req = new NextRequest('http://localhost/api/webhooks/payments', {
      method: 'PUT',
      body: JSON.stringify({ id: '1', status: 'success' })
    });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('OPTIONS returns 204', async () => {
    const req = new NextRequest('http://localhost/api/webhooks/payments', { method: 'OPTIONS' });
    const res = await OPTIONS(req);
    expect(res.status).toBe(204);
  });
});

