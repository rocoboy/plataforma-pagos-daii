import { NextRequest } from 'next/server';
import { updatePayment } from './update-payment';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server');

interface MockSupabase {
  from: jest.Mock<MockSupabase, []>;
  update: jest.Mock<MockSupabase, [Record<string, unknown>]>;
  eq: jest.Mock<MockSupabase, [string, string]>;
  select: jest.Mock<MockSupabase, [string]>;
  single: jest.Mock<Promise<{ data: Record<string, unknown> | null; error: Error | null }>, []>;
}

const mockSupabase: MockSupabase = {
  from: jest.fn(() => mockSupabase),
  update: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  single: jest.fn(),
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);

describe('Update Payment - Extra Coverage', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = new NextRequest('http://localhost/api/webhooks/payments', { method: 'PUT' });
  });

  it('updates to SUCCESS status', async () => {
    mockSupabase.single.mockResolvedValue({ 
      data: { id: 'p1', status: 'SUCCESS' }, 
      error: null 
    });

    const result = await updatePayment(mockRequest, 'p1', 'SUCCESS');
    expect(result.status).toBe('SUCCESS');
  });

  it('updates to FAILED status', async () => {
    mockSupabase.single.mockResolvedValue({ 
      data: { id: 'p2', status: 'FAILED' }, 
      error: null 
    });

    const result = await updatePayment(mockRequest, 'p2', 'FAILED');
    expect(result.status).toBe('FAILED');
  });

  it('updates to PENDING status', async () => {
    mockSupabase.single.mockResolvedValue({ 
      data: { id: 'p3', status: 'PENDING' }, 
      error: null 
    });

    const result = await updatePayment(mockRequest, 'p3', 'PENDING');
    expect(result.status).toBe('PENDING');
  });

  it('updates to PROCESSING status', async () => {
    mockSupabase.single.mockResolvedValue({ 
      data: { id: 'p4', status: 'PROCESSING' }, 
      error: null 
    });

    const result = await updatePayment(mockRequest, 'p4', 'PROCESSING');
    expect(result.status).toBe('PROCESSING');
  });

  it('updates to CANCELLED status', async () => {
    mockSupabase.single.mockResolvedValue({ 
      data: { id: 'p5', status: 'CANCELLED' }, 
      error: null 
    });

    const result = await updatePayment(mockRequest, 'p5', 'CANCELLED');
    expect(result.status).toBe('CANCELLED');
  });

  it('handles different payment ids', async () => {
    mockSupabase.single.mockResolvedValue({ 
      data: { id: 'custom-id-123', status: 'SUCCESS' }, 
      error: null 
    });

    const result = await updatePayment(mockRequest, 'custom-id-123', 'SUCCESS');
    expect(result.id).toBe('custom-id-123');
  });
});

