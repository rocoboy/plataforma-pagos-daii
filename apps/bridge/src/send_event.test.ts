import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { Kafka, Producer } from 'kafkajs';
import { appConfig } from './config';

// Type definitions (from apps/types)
type ID = string & { readonly __brand: "ID" };
type ISODateTime = string & { readonly __brand: "ISODateTime" };
type PaymentProvider = "Talo" | "Interbanking" | "Mercado Pago";
type PaymentStatus = "APPROVED" | "REJECTED" | "PENDING";

type EPaymentCreated = {
  id: ID;
  name: "payment.created";
  occurred_at: ISODateTime;
  correlation_id?: ID;
  source: "core" | "payments-svc" | "psp-emulator" | "billing-svc";
  data: {
    payment: {
      id: ID;
      payment_intent_id?: ID;
      booking_id: ID;
      provider: PaymentProvider;
      status: PaymentStatus;
      amount: number;
      currency: "ARS" | "USD" | "EUR";
    };
  };
};

describe('Send Payment Created Event', () => {
  let producer: Producer;
  let kafka: Kafka;

  beforeAll(async () => {
    // Initialize Kafka client
    kafka = new Kafka({
      clientId: 'test-producer',
      brokers: [appConfig.kafka.broker],
      connectionTimeout: 3000,
      requestTimeout: 25000,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });

    // Create producer
    producer = kafka.producer();
    await producer.connect();
    console.log('✅ Test producer connected to Kafka');
  });

  afterAll(async () => {
    // Cleanup
    await producer.disconnect();
    console.log('✅ Test producer disconnected');
  });

  test('should send payment.created event to payments.events topic', async () => {
    // Create a payment.created event
    const paymentCreatedEvent: EPaymentCreated = {
      id: `evt_${Date.now()}` as ID,
      name: 'payment.created',
      occurred_at: new Date().toISOString() as ISODateTime,
      correlation_id: `corr_${Date.now()}` as ID,
      source: 'payments-svc',
      data: {
        payment: {
          id: `pay_${Date.now()}` as ID,
          payment_intent_id: `pi_${Date.now()}` as ID,
          booking_id: `bkg_${Date.now()}` as ID,
          provider: 'Talo',
          status: 'APPROVED',
          amount: 15000,
          currency: 'ARS'
        }
      }
    };

    console.log('📤 Sending payment.created event:', JSON.stringify(paymentCreatedEvent, null, 2));

    // Send message to payments.events topic
    const result = await producer.send({
      topic: 'payments.events',
      messages: [
        {
          key: paymentCreatedEvent.data.payment.id,
          value: JSON.stringify(paymentCreatedEvent),
          headers: {
            'messageId': paymentCreatedEvent.id,
            'eventType': 'payment.created',
            'source': 'payments-svc',
            'timestamp': new Date().toISOString()
          }
        }
      ]
    });

    // Verify the message was sent
    expect(result).toBeDefined();
    expect(result[0].topicName).toBe('payments.events');
    expect(result[0].errorCode).toBe(0);
    
    console.log('✅ Message sent successfully:', result);
  });

  test('should send payment.created event with PENDING status', async () => {
    // Create a payment.created event with PENDING status
    const paymentCreatedEvent: EPaymentCreated = {
      id: `evt_${Date.now()}` as ID,
      name: 'payment.created',
      occurred_at: new Date().toISOString() as ISODateTime,
      correlation_id: `corr_${Date.now()}` as ID,
      source: 'psp-emulator',
      data: {
        payment: {
          id: `pay_${Date.now()}` as ID,
          payment_intent_id: `pi_${Date.now()}` as ID,
          booking_id: `bkg_${Date.now()}` as ID,
          provider: 'Interbanking',
          status: 'PENDING',
          amount: 25000,
          currency: 'USD'
        }
      }
    };

    console.log('📤 Sending payment.created event (PENDING):', JSON.stringify(paymentCreatedEvent, null, 2));

    // Send message to payments.events topic
    const result = await producer.send({
      topic: 'payments.events',
      messages: [
        {
          key: paymentCreatedEvent.data.payment.id,
          value: JSON.stringify(paymentCreatedEvent),
          headers: {
            'messageId': paymentCreatedEvent.id,
            'eventType': 'payment.created',
            'source': 'psp-emulator',
            'timestamp': new Date().toISOString()
          }
        }
      ]
    });

    // Verify the message was sent
    expect(result).toBeDefined();
    expect(result[0].topicName).toBe('payments.events');
    expect(result[0].errorCode).toBe(0);
    
    console.log('✅ Message sent successfully:', result);
  });

  test('should send payment.created event with EUR currency', async () => {
    // Create a payment.created event with EUR currency
    const paymentCreatedEvent: EPaymentCreated = {
      id: `evt_${Date.now()}` as ID,
      name: 'payment.created',
      occurred_at: new Date().toISOString() as ISODateTime,
      correlation_id: `corr_${Date.now()}` as ID,
      source: 'payments-svc',
      data: {
        payment: {
          id: `pay_${Date.now()}` as ID,
          payment_intent_id: `pi_${Date.now()}` as ID,
          booking_id: `bkg_${Date.now()}` as ID,
          provider: 'Mercado Pago',
          status: 'APPROVED',
          amount: 5000,
          currency: 'EUR'
        }
      }
    };

    console.log('📤 Sending payment.created event (EUR):', JSON.stringify(paymentCreatedEvent, null, 2));

    // Send message to payments.events topic
    const result = await producer.send({
      topic: 'payments.events',
      messages: [
        {
          key: paymentCreatedEvent.data.payment.id,
          value: JSON.stringify(paymentCreatedEvent),
          headers: {
            'messageId': paymentCreatedEvent.id,
            'eventType': 'payment.created',
            'source': 'payments-svc',
            'timestamp': new Date().toISOString()
          }
        }
      ]
    });

    // Verify the message was sent
    expect(result).toBeDefined();
    expect(result[0].topicName).toBe('payments.events');
    expect(result[0].errorCode).toBe(0);
    
    console.log('✅ Message sent successfully:', result);
  });
});

