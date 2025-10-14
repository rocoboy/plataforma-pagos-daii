// API client for backend communication
// Note: JWT tokens are automatically added by the API interceptor

export interface PaymentRow {
  id: string;
  amount: number;
  created_at: string;
  currency: 'ARS' | 'USD' | 'EUR';
  res_id: string;
  status: string | null;
  user_id: string | null;
  meta: any | null;
  modified_at: string | null;
}

export interface PaymentsApiResponse {
  success: boolean;
  payments: PaymentRow[];
}
  
const getApiUrl = () => process.env.REACT_APP_VERCEL_API || 'http://localhost:3000';

export type PaymentsResponse = PaymentRow[];

/**
 * Create standard headers for API requests
 * JWT tokens are automatically added by the API interceptor
 */
const createHeaders = (additionalHeaders: Record<string, string> = {}): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };
};

export async function fetchPayments(): Promise<PaymentsResponse> {
  try {
    // JWT token will be automatically added by the interceptor
    const response = await fetch(`${getApiUrl()}/payments`, {
      method: 'GET',
      headers: createHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data: PaymentsApiResponse = await response.json();
    if (!data.success) {
      throw new Error(`API Error: ${JSON.stringify(data)}`);
    }
    return data.payments;
  } catch (error) {
    console.error('fetchPayments error:', error);
    throw error;
  }
}

/**
 * Create a new payment
 * JWT token will be automatically added by the interceptor
 */
export async function createPayment(paymentData: {
  res_id: string;
  user_id: string;
  amount: number;
  currency: string;
  meta?: string;
}): Promise<PaymentRow> {
  try {
    const response = await fetch(`${getApiUrl()}/webhooks/payments`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to create payment');
    }
    
    return data.payment;
  } catch (error) {
    console.error('createPayment error:', error);
    throw error;
  }
}

/**
 * Update payment status
 * JWT token will be automatically added by the interceptor
 */
export async function updatePaymentStatus(paymentId: string, status: string): Promise<PaymentRow> {
  try {
    const response = await fetch(`${getApiUrl()}/webhooks/payments`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify({ id: paymentId, status }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to update payment');
    }
    
    return data.payment;
  } catch (error) {
    console.error('updatePaymentStatus error:', error);
    throw error;
  }
}