const amqp = require('amqplib');

export class EventPublisher {
  private connection: any = null;
  private channel: any = null;
  private isConnected = false;

  constructor(
    private rabbitmqUrl: string = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672/',
    private exchange: string = process.env.RABBITMQ_EXCHANGE || 'payments'
  ) {}

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      // Declare exchange
      await this.channel.assertExchange(this.exchange, 'topic', {
        durable: true,
      });

      this.isConnected = true;
      console.log('Connected to RabbitMQ for event publishing');

      // Handle connection close
      this.connection.on('close', () => {
        console.log('RabbitMQ publisher connection closed');
        this.isConnected = false;
      });

      this.connection.on('error', (err: any) => {
        console.error('RabbitMQ publisher connection error:', err);
        this.isConnected = false;
      });

    } catch (error) {
      console.error('Failed to connect to RabbitMQ for event publishing:', error);
      throw error;
    }
  }

  async publishPaymentCompleted(event: any): Promise<void> {
    await this.ensureConnected();
    await this.publishEvent('payment.completed', event);
  }

  async publishPaymentFailed(event: any): Promise<void> {
    await this.ensureConnected();
    await this.publishEvent('payment.failed', event);
  }

  private async publishEvent(routingKey: string, event: any): Promise<void> {
    if (!this.channel) {
      throw new Error('No channel available for publishing');
    }

    try {
      const eventData = JSON.stringify(event);
      const published = this.channel.publish(
        this.exchange,
        routingKey,
        Buffer.from(eventData),
        {
          persistent: true,
          messageId: event.id,
          timestamp: Date.now(),
          contentType: 'application/json',
        }
      );

      if (!published) {
        throw new Error('Failed to publish event to exchange');
      }

      console.log(`Published event: ${routingKey} with ID: ${event.id}`);
    } catch (error) {
      console.error(`Failed to publish event ${routingKey}:`, error);
      throw error;
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected || !this.connection || !this.channel) {
      await this.connect();
    }
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.isConnected = false;
    console.log('Event publisher connection closed');
  }
}

// Singleton instance for use across the API
let eventPublisher: EventPublisher | null = null;

export function getEventPublisher(): EventPublisher {
  if (!eventPublisher) {
    eventPublisher = new EventPublisher();
  }
  return eventPublisher;
}

// Helper function to create payment events
export function createPaymentCompletedEvent(
  paymentData: any,
  transactionId?: string,
  gatewayResponse?: any
): any {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: 'payment.completed',
    occurred_at: new Date().toISOString(),
    source: 'payments-svc',
    data: {
      payment: {
        id: paymentData.id,
        payment_intent_id: paymentData.payment_intent_id,
        booking_id: paymentData.res_id, // res_id maps to booking_id
        provider: 'Talo', // Use valid provider
        status: paymentData.status,
        amount: paymentData.amount,
        currency: paymentData.currency,
      },
      transaction_id: transactionId,
      gateway_response: gatewayResponse,
    },
  };
}

export function createPaymentFailedEvent(
  paymentData: any,
  reason: string,
  gatewayResponse?: any
): any {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: 'payment.failed',
    occurred_at: new Date().toISOString(),
    source: 'payments-svc',
    data: {
      payment: {
        id: paymentData.id,
        payment_intent_id: paymentData.payment_intent_id,
        booking_id: paymentData.res_id, // res_id maps to booking_id
        provider: 'Talo', // Use valid provider
        status: paymentData.status,
        amount: paymentData.amount,
        currency: paymentData.currency,
      },
      reason,
      gateway_response: gatewayResponse,
    },
  };
}