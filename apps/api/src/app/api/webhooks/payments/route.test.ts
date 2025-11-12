import { NextRequest } from 'next/server';
import { POST, PUT, OPTIONS } from './route';

jest.mock('@/lib/core', () => ({
  publishPaymentStatusUpdated: jest.fn(async () => Promise.resolve())
}));

jest.mock('@plataforma/types', () => ({
  updatePaymentBodySchema: {
    safeParse: jest.fn((data) => {
      if (data.id && data.status) {
        return { success: true, data };
      }
      return { success: false, error: { message: 'Invalid' } };
    })
  }
}));

jest.mock('./create-payment', () => ({
  createPayment: jest.fn(async () => ({ 
    id: '1', 
    res_id: 'R1', 
    amount: 10, 
    currency: 'ARS',
    status: 'PENDING'
  })),
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
  updatePayment: jest.fn(async () => ({ id: '1', status: 'success', res_id: 'R1', user_id: 'U1', amount: 100, currency: 'ARS' }))
}));

jest.mock('@/lib/cors', () => ({
  createCorsResponse: jest.fn((req, data, status = 200) => new Response(JSON.stringify(data), { status })),
  createCorsOptionsResponse: jest.fn(() => new Response(null, { status: 204 }))
}));

describe('webhooks/payments route', () => {
  const { publishPaymentStatusUpdated } = require('@/lib/core');
  const { createPayment } = require('./create-payment');
  const { updatePayment } = require('./update-payment');
  const { createCorsResponse } = require('@/lib/cors');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST', () => {
    it('creates payment with valid body', async () => {
      const req = new NextRequest('http://localhost/api/webhooks/payments', {
        method: 'POST',
        body: JSON.stringify({ res_id: 'R1', user_id: 'U1', amount: 10, currency: 'ARS' })
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(publishPaymentStatusUpdated).toHaveBeenCalled();
    });

    it('returns 400 on invalid body', async () => {
      const req = new NextRequest('http://localhost/api/webhooks/payments', {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' })
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid request body');
    });

    it('handles publishPaymentStatusUpdated error', async () => {
      publishPaymentStatusUpdated.mockRejectedValueOnce(new Error('Kafka error'));
      
      const req = new NextRequest('http://localhost/api/webhooks/payments', {
        method: 'POST',
        body: JSON.stringify({ res_id: 'R1', user_id: 'U1', amount: 10, currency: 'ARS' })
      });
      
      const res = await POST(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('❌ Failed to publish payment status updated event:'),
        expect.any(Error)
      );
    });

    it('handles createPayment error', async () => {
      createPayment.mockRejectedValueOnce(new Error('Database error'));
      
      const req = new NextRequest('http://localhost/api/webhooks/payments', {
        method: 'POST',
        body: JSON.stringify({ res_id: 'R1', user_id: 'U1', amount: 10, currency: 'ARS' })
      });
      
      const res = await POST(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error in POST /api/webhooks/payments:'),
        expect.any(Error)
      );
    });

    it('handles non-Error exceptions', async () => {
      createPayment.mockRejectedValueOnce('String error');
      
      const req = new NextRequest('http://localhost/api/webhooks/payments', {
        method: 'POST',
        body: JSON.stringify({ res_id: 'R1', user_id: 'U1', amount: 10, currency: 'ARS' })
      });
      
      const res = await POST(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Unknown error');
    });
  });

  describe('PUT', () => {
    it('updates payment with valid body', async () => {
      const req = new NextRequest('http://localhost/api/webhooks/payments', {
        method: 'PUT',
        body: JSON.stringify({ id: '1', status: 'success' })
      });
      const res = await PUT(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(publishPaymentStatusUpdated).toHaveBeenCalled();
    });

    it('returns 400 on invalid body', async () => {
      const req = new NextRequest('http://localhost/api/webhooks/payments', {
        method: 'PUT',
        body: JSON.stringify({ invalid: 'data' })
      });
      const res = await PUT(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe('Invalid request body');
    });

    it('handles publishPaymentStatusUpdated error', async () => {
      publishPaymentStatusUpdated.mockRejectedValueOnce(new Error('Kafka error'));
      
      const req = new NextRequest('http://localhost/api/webhooks/payments', {
        method: 'PUT',
        body: JSON.stringify({ id: '1', status: 'success' })
      });
      
      const res = await PUT(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('❌ Failed to publish payment status updated event:'),
        expect.any(Error)
      );
    });

    it('handles updatePayment error', async () => {
      updatePayment.mockRejectedValueOnce(new Error('Database error'));
      
      const req = new NextRequest('http://localhost/api/webhooks/payments', {
        method: 'PUT',
        body: JSON.stringify({ id: '1', status: 'success' })
      });
      
      const res = await PUT(req);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error in PUT /api/webhooks/payments:'),
        expect.any(Error)
      );
    });
  });

  describe('OPTIONS', () => {
    it('returns 204', async () => {
      const req = new NextRequest('http://localhost/api/webhooks/payments', { method: 'OPTIONS' });
      const res = await OPTIONS(req);
      expect(res.status).toBe(204);
    });
  });
});

