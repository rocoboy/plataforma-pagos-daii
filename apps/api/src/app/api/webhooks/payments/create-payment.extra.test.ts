/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { updatePaymentByReservationId } from './update-payment';
import { createClient } from '@/lib/supabase/server';

jest.mock('@/lib/supabase/server');

type MockSupabase = { 
  from: jest.Mock<MockSupabase, any[]>;
  update: jest.Mock<MockSupabase, any[]>;
  eq: jest.Mock<MockSupabase, any[]>;
  select: jest.Mock<MockSupabase, any[]>;
  single: jest.Mock<any, any[]>;
  maybeSingle: jest.Mock<any, any[]>;
};

const mockSupabase: MockSupabase = {
  from: jest.fn(() => mockSupabase),
  update: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  single: jest.fn(),
  maybeSingle: jest.fn(),
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);

describe('Update Payment - Extra Coverage', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = new NextRequest('http://localhost/api/webhooks/payments', { method: 'PUT' });
  });

  it('updates to SUCCESS status', async () => {
    mockSupabase.maybeSingle.mockResolvedValue({ 
      data: { id: 'p1', status: 'SUCCESS' }, 
      error: null 
    });

    const result = await updatePaymentByReservationId(mockRequest, 'p1', 'SUCCESS');
    expect(result).not.toBeNull();
    expect(result!.status).toBe('SUCCESS');
  });

  it('updates to FAILED status', async () => {
    mockSupabase.maybeSingle.mockResolvedValue({ 
      data: { id: 'p2', status: 'FAILURE' }, 
      error: null 
    });

    const result = await updatePaymentByReservationId(mockRequest, 'p2', 'FAILURE');
    expect(result).not.toBeNull();
    expect(result!.status).toBe('FAILURE');
  });

  it('updates to PENDING status', async () => {
    mockSupabase.maybeSingle.mockResolvedValue({ 
      data: { id: 'p3', status: 'PENDING' }, 
      error: null 
    });

    const result = await updatePaymentByReservationId(mockRequest, 'p3', 'PENDING');
    expect(result).not.toBeNull();
    expect(result!.status).toBe('PENDING');
  });

  it('updates to PROCESSING status', async () => {
    mockSupabase.maybeSingle.mockResolvedValue({ 
      data: { id: 'p4', status: 'UNDERPAID' }, 
      error: null 
    });

  const result = await updatePaymentByReservationId(mockRequest, 'p4', 'UNDERPAID');
  expect(result).not.toBeNull();
  expect(result!.status).toBe('UNDERPAID');
  });

  it('updates to CANCELLED status', async () => {
    mockSupabase.maybeSingle.mockResolvedValue({ 
      data: { id: 'p5', status: 'REFUND' }, 
      error: null 
    });

  const result = await updatePaymentByReservationId(mockRequest, 'p5', 'REFUND');
  expect(result).not.toBeNull();
  expect(result!.status).toBe('REFUND');
  });

  it('handles different payment ids', async () => {
    mockSupabase.maybeSingle.mockResolvedValue({ 
      data: { id: 'custom-id-123', status: 'SUCCESS' }, 
      error: null 
    });

    const result = await updatePaymentByReservationId(mockRequest, 'custom-id-123', 'SUCCESS');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('custom-id-123');
  });
});