import { fetchPayments } from './apiClient';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/payments', expect.any(Object));
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
