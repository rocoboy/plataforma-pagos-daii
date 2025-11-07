import { fetchPayments, createPayment, updatePaymentStatus } from './apiClient';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Store original environment
const originalEnv = process.env;

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment
    process.env = { ...originalEnv, REACT_APP_VERCEL_API: 'http://localhost:3000' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('fetchPayments', () => {
    it('fetches payments successfully', async () => {
      const mockResponse = {
        success: true,
        payments: [
          {
            id: '1',
            amount: 350.00,
            created_at: '2025-01-15T10:30:00Z',
            currency: 'USD',
            res_id: 'BKG123456',
            status: 'success',
            user_id: 'user_001',
            meta: null,
            modified_at: null,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchPayments();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/payments',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(mockResponse.payments);
    });

    it('handles API error response', async () => {
      const mockResponse = {
        success: false,
        payments: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await expect(fetchPayments()).rejects.toThrow('API Error');
    });

    it('handles HTTP error status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(fetchPayments()).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('handles network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchPayments()).rejects.toThrow('Network error');
    });
  });

  describe('createPayment', () => {
    it('creates payment successfully', async () => {
      const paymentData = {
        res_id: 'BKG123456',
        user_id: 'user_001',
        amount: 350.00,
        currency: 'USD',
      };

      const mockResponse = {
        success: true,
        payment: {
          id: '1',
          ...paymentData,
          created_at: '2025-01-15T10:30:00Z',
          status: 'pending',
          meta: null,
          modified_at: null,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await createPayment(paymentData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/webhooks/payments',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(paymentData)
        })
      );
      expect(result).toEqual(mockResponse.payment);
    });

    it('handles create payment error', async () => {
      const paymentData = {
        res_id: 'BKG123456',
        user_id: 'user_001',
        amount: 350.00,
        currency: 'USD',
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      } as Response);

      await expect(createPayment(paymentData)).rejects.toThrow('HTTP 400: Bad Request');
    });
  });

  describe('updatePaymentStatus', () => {
    it('updates payment status successfully', async () => {
      const paymentId = '1';
      const status = 'success';

      const mockResponse = {
        success: true,
        payment: {
          id: paymentId,
          amount: 350.00,
          created_at: '2025-01-15T10:30:00Z',
          currency: 'USD',
          res_id: 'BKG123456',
          status: status,
          user_id: 'user_001',
          meta: null,
          modified_at: '2025-01-15T11:00:00Z',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await updatePaymentStatus(paymentId, status);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/webhooks/payments',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ id: paymentId, status })
        })
      );
      expect(result).toEqual(mockResponse.payment);
    });

    it('handles update payment error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(updatePaymentStatus('1', 'success')).rejects.toThrow('HTTP 404: Not Found');
    });
  });
});
