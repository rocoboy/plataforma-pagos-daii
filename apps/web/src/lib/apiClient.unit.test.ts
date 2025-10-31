// Simple unit test for apiClient exports
import { createPayment, updatePaymentStatus } from './apiClient';

global.fetch = jest.fn();

describe('apiClient', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('createPayment is a function', () => {
    expect(typeof createPayment).toBe('function');
  });

  it('updatePaymentStatus is a function', () => {
    expect(typeof updatePaymentStatus).toBe('function');
  });
});

