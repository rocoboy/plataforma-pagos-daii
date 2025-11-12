/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { updatePaymentByReservationId } from './update-payment';

let lastUpdateStatus = 'SUCCESS';
let lastPaymentId = 'p1';

jest.mock('@/lib/supabase/server', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn(() => ({
      update: jest.fn((updateData: { status?: string }) => {
        if (updateData.status) lastUpdateStatus = updateData.status;
        return {
          eq: jest.fn(() => ({
            error: null
          }))
        };
      }),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(() => ({
            data: { 
              id: lastPaymentId, 
              res_id: 'res1', 
              amount: 100, 
              status: lastUpdateStatus,
              currency: 'ARS', 
              created_at: new Date().toISOString() 
            },
            error: null
          }))
        }))
      }))
    }))
  }))
}));

describe('Update Payment - Extra Coverage', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    lastUpdateStatus = 'SUCCESS';
    lastPaymentId = 'p1';
    mockRequest = new NextRequest('http://localhost/api/webhooks/payments', { method: 'PUT' });
  });

  it('updates to SUCCESS status', async () => {
    lastPaymentId = 'p1';
    const result = await updatePaymentByReservationId(mockRequest, 'p1', 'SUCCESS');
    expect(result).not.toBeNull();
    expect(result!.status).toBe('SUCCESS');
  });

  it('updates to FAILED status', async () => {
    lastPaymentId = 'p2';
    const result = await updatePaymentByReservationId(mockRequest, 'p2', 'FAILURE');
    expect(result).not.toBeNull();
    expect(result!.status).toBe('FAILURE');
  });

  it('updates to PENDING status', async () => {
    lastPaymentId = 'p3';
    const result = await updatePaymentByReservationId(mockRequest, 'p3', 'PENDING');
    expect(result).not.toBeNull();
    expect(result!.status).toBe('PENDING');
  });

  it('updates to PROCESSING status', async () => {
    lastPaymentId = 'p4';
    const result = await updatePaymentByReservationId(mockRequest, 'p4', 'UNDERPAID');
    expect(result).not.toBeNull();
    expect(result!.status).toBe('UNDERPAID');
  });

  it('updates to CANCELLED status', async () => {
    lastPaymentId = 'p5';
    const result = await updatePaymentByReservationId(mockRequest, 'p5', 'REFUND');
    expect(result).not.toBeNull();
    expect(result!.status).toBe('REFUND');
  });

  it('handles different payment ids', async () => {
    lastPaymentId = 'custom-id-123';
    const result = await updatePaymentByReservationId(mockRequest, 'custom-id-123', 'SUCCESS');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('custom-id-123');
  });
});