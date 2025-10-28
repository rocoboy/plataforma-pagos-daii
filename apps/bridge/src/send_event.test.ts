import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { Kafka, Producer, Partitioners } from 'kafkajs';
import { appConfig } from './config';

// Type definitions (FLAT, based on core schema)
type ID = string & { readonly __brand: "ID" };
type ISODateTime = string & { readonly __brand: "ISODateTime" };
// El schema del core usa estos estados
type CorePaymentStatus = "PENDING" | "SUCCESS" | "FAILURE" | "EXPIRED" | "REFUND";

// Schema para el payload de status_updated (
type EPaymentStatusUpdatedData = {
  paymentId: ID;
  reservationId: ID;
  userId: ID;
  status: CorePaymentStatus;
  amount: number;
  currency: "ARS" | "USD" | "EUR";
  updatedAt: ISODateTime;
};

// Tipo del mensaje de Kafka
type EPaymentStatusUpdated = {
  id: ID;
  name: "payments.payment.status_updated"; 
  occurred_at: ISODateTime;
  correlation_id?: ID;
  source: "payments-svc";
  schema_version: string;
  data: EPaymentStatusUpdatedData;
};

describe('Send Payment Status Updated Event', () => {
  let producer: Producer;
  let kafka: Kafka;

  beforeAll(async () => {
    kafka = new Kafka({
      clientId: 'test-producer',
      brokers: [appConfig.kafka.broker],
      connectionTimeout: 3000,
      requestTimeout: 25000,
    });

    producer = kafka.producer({ 
      // Silenciar el warning de particionador
      createPartitioner: Partitioners.DefaultPartitioner 
    });
    await producer.connect();
    console.log('✅ Test producer connected to Kafka');
  });

  afterAll(async () => {
    await producer.disconnect();
    console.log('✅ Test producer disconnected');
  });

  test('should send payments.payment.status_updated event', async () => {
    const now = new Date();
    const eventId = `evt_upd_${now.getTime()}` as ID;
    
    // Crear un evento con la estructura PLANA y correcta
    const event: EPaymentStatusUpdated = {
      id: eventId,
      name: 'payments.payment.status_updated', // <-- El tipo de evento
      occurred_at: now.toISOString() as ISODateTime,
      correlation_id: `corr_upd_${now.getTime()}` as ID,
      source: 'payments-svc',
      schema_version: '1.0',
      data: { 
        paymentId: '418f715c-bce8-4a67-8eaf-8aaf485c193a' as ID,
        reservationId: '1ABCDEF' as ID,
        userId: '5367' as ID,
        status: 'SUCCESS',
        amount: 700000.00,
        currency: 'ARS',
        updatedAt: now.toISOString() as ISODateTime
      }
    };

    console.log('📤 Sending payments.payment.status_updated event:', JSON.stringify(event, null, 2));

    const result = await producer.send({
      topic: 'payments.events', 
      messages: [
        {
          key: event.data.paymentId,
          value: JSON.stringify(event),
          headers: {
            'messageId': event.id,
            'eventType': event.name,
            'source': event.source,
            'timestamp': event.occurred_at
          }
        }
      ]
    });

    expect(result).toBeDefined();
    expect(result[0].topicName).toBe('payments.events');
    expect(result[0].errorCode).toBe(0);
    
    console.log('✅ Message sent successfully:', result);
  });
});

