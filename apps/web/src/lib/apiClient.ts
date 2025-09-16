// API client for backend communication

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

export type PaymentsResponse = PaymentRow[];

export async function fetchPayments(): Promise<PaymentsResponse> {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/payments`);
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