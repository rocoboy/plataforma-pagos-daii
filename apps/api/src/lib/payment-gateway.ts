export interface PaymentRequest {
  amount: number;
  currency: string;
  cardNumber?: string;
  cardHolder?: string;
  cvv?: string;
  expiryMonth?: string;
  expiryYear?: string;
  paymentMethodId?: string;
}

export interface GatewayResponse {
  success: boolean;
  transactionId?: string;
  errorCode?: string;
  errorMessage?: string;
  gatewayResponse?: any;
}

export class PaymentGateway {
  /**
   * Simulates payment processing through a gateway
   * Rules for emulation:
   * - Amounts over 1,000,000 are rejected (high risk) - adjusted for ARS
   * - Card numbers ending in '0000' are rejected (test failure case)
   * - Card numbers ending in '1111' take longer but succeed
   * - Random 5% failure rate for realistic simulation
   */
  async processPayment(request: PaymentRequest): Promise<GatewayResponse> {
    // Simulate processing delay
    await this.simulateDelay();

    // Check amount limits (adjusted for ARS)
    if (request.amount > 1000000) {
      return {
        success: false,
        errorCode: 'AMOUNT_LIMIT_EXCEEDED',
        errorMessage: 'Transaction amount exceeds the allowed limit',
        gatewayResponse: {
          risk_score: 95,
          reason: 'high_amount'
        }
      };
    }

    // Check for test card numbers
    if (request.cardNumber?.endsWith('0000')) {
      return {
        success: false,
        errorCode: 'CARD_DECLINED',
        errorMessage: 'The card was declined by the issuing bank',
        gatewayResponse: {
          decline_code: 'generic_decline',
          card_response: 'do_not_honor'
        }
      };
    }

    // Simulate random failures (5% chance)
    if (Math.random() < 0.05) {
      return {
        success: false,
        errorCode: 'PROCESSING_ERROR',
        errorMessage: 'A temporary processing error occurred',
        gatewayResponse: {
          network_error: true,
          retry_after: 300
        }
      };
    }

    // Success case
    const transactionId = this.generateTransactionId();
    
    return {
      success: true,
      transactionId,
      gatewayResponse: {
        authorization_code: this.generateAuthCode(),
        processor_response: 'approved',
        network_transaction_id: transactionId,
        processing_time_ms: Math.floor(Math.random() * 2000) + 500
      }
    };
  }

  private async simulateDelay(): Promise<void> {
    // Simulate network latency (100-800ms)
    const delay = Math.floor(Math.random() * 700) + 100;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private generateTransactionId(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `txn_${timestamp}_${random}`;
  }

  private generateAuthCode(): string {
    return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  }

  /**
   * Validates card information (basic validation for simulation)
   */
  validateCardInfo(request: PaymentRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.cardNumber || request.cardNumber.length < 13) {
      errors.push('Invalid card number');
    }

    if (!request.cvv || request.cvv.length < 3) {
      errors.push('Invalid CVV');
    }

    if (!request.expiryMonth || !request.expiryYear) {
      errors.push('Invalid expiry date');
    }

    if (!request.cardHolder || request.cardHolder.trim().length < 2) {
      errors.push('Invalid card holder name');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}