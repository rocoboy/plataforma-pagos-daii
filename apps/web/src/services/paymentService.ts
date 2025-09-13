// Payment service types based on backend API
export interface Payment {
  id: string;
  res_id: string;
  amount: number;
  currency: 'ARS' | 'USD' | 'EUR';
  status: 'PENDING' | 'SUCCESS' | 'FAILURE' | 'UNDERPAID' | 'OVERPAID' | 'EXPIRED' | 'REFUND';
  user_id?: string;
  meta?: any;
  created_at: string;
  modified_at?: string;
}

export interface CreatePaymentRequest {
  res_id: string;
  amount: number;
  currency?: 'ARS' | 'USD' | 'EUR';
  user_id?: string;
  meta?: any;
}

export interface UpdatePaymentRequest {
  id: string;
  status: Payment['status'];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  issues?: string;
}

// API Base URL - you might want to configure this based on environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class PaymentService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('Making request to:', url); // Debug log
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('Response status:', response.status); // Debug log
      console.log('Response ok:', response.ok); // Debug log

      console.log('Response status:', response.status); // Debug log
      console.log('Response ok:', response.ok); // Debug log

      const data = await response.json();
      console.log('Response data:', data); // Debug log

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          issues: data.issues,
        };
      }

      return {
        success: true,
        data: data.payments || data.payment || data,
      };
    } catch (error) {
      console.error('Request failed:', error); // Debug log
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // GET /api/payments - Get all payments
  async getAllPayments(): Promise<ApiResponse<Payment[]>> {
    return this.request<Payment[]>('/api/payments');
  }

  // GET /api/payments/:id - Get specific payment
  async getPayment(id: string): Promise<ApiResponse<Payment>> {
    return this.request<Payment>(`/api/payments/${id}`);
  }

  // POST /api/webhooks/payments - Create new payment
  async createPayment(paymentData: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
    return this.request<Payment>('/api/webhooks/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // PUT /api/webhooks/payments - Update payment status
  async updatePayment(updateData: UpdatePaymentRequest): Promise<ApiResponse<Payment>> {
    return this.request<Payment>('/api/webhooks/payments', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Utility method to format currency
  formatCurrency(amount: number, currency: Payment['currency']): string {
    const symbols = {
      ARS: '$',
      USD: 'US$',
      EUR: '€',
    };
    
    return `${symbols[currency]}${amount.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  // Utility method to get status color
  getStatusColor(status: Payment['status']): string {
    const colors = {
      PENDING: '#f59e0b', // yellow
      SUCCESS: '#10b981', // green
      FAILURE: '#ef4444', // red
      UNDERPAID: '#f59e0b', // yellow
      OVERPAID: '#6366f1', // indigo
      EXPIRED: '#6b7280', // gray
      REFUND: '#8b5cf6', // purple
    };
    return colors[status] || '#6b7280';
  }

  // Utility method to get status label in Spanish
  getStatusLabel(status: Payment['status']): string {
    const labels = {
      PENDING: 'Pendiente',
      SUCCESS: 'Exitoso',
      FAILURE: 'Fallido',
      UNDERPAID: 'Pago Parcial',
      OVERPAID: 'Sobrepago',
      EXPIRED: 'Expirado',
      REFUND: 'Reembolso',
    };
    return labels[status] || status;
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
