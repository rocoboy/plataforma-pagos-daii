import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import { Kafka, Producer } from 'kafkajs';
import { appConfig } from './config';

describe('Send Payment Created Event', () => {
  let producer: Producer;
  let kafka: Kafka;

  beforeAll(async () => {
    kafka = new Kafka({
      clientId: 'test-producer',
      brokers: [appConfig.kafka.broker],
      connectionTimeout: 3000,
      requestTimeout: 25000,
    });
    producer = kafka.producer();
    await producer.connect();
    console.log('✅ Test producer connected to Kafka');
  });

  afterAll(async () => {
    await producer.disconnect();
    console.log('✅ Test producer disconnected');
  });

  test('should send ARS payment event to core.ingress', async () => {
    const paymentPayload = {
      res_id: `bkg_${Date.now()}`,
      user_id: `usr_${Date.now()}`,
      amount: 15000,
      currency: "ARS",
      meta: {
        provider: 'Talo',
        original_status: 'APPROVED',
        payment_intent_id: `pi_${Date.now()}`
      }
    };

    const result = await producer.send({
      topic: 'core.ingress',
      messages: [{
        key: paymentPayload.res_id,
        value: JSON.stringify(paymentPayload),
        headers: {
          'eventType': 'payment.created',
          'eventId': `evt_${Date.now()}`,
          'source': 'payments-svc',
          'timestamp': new Date().toISOString()
        }
      }]
    });

    expect(result[0].topicName).toBe('core.ingress');
    expect(result[0].errorCode).toBe(0);
    console.log('✅ ARS Payment sent successfully to core.ingress');
  });

  test('should send PENDING payment event to core.ingress', async () => {
    const paymentPayload = {
      res_id: `bkg_${Date.now()}`,
      user_id: `usr_${Date.now()}`,
      amount: 25000,
      currency: "USD",
      meta: {
        provider: 'Interbanking',
        original_status: 'PENDING',
        payment_intent_id: `pi_${Date.now()}`
      }
    };

    const result = await producer.send({
      topic: 'core.ingress',
      messages: [{
        key: paymentPayload.res_id,
        value: JSON.stringify(paymentPayload),
        headers: {
          'eventType': 'payment.created',
          'eventId': `evt_${Date.now()}`,
          'source': 'psp-emulator',
          'timestamp': new Date().toISOString()
        }
      }]
    });

    expect(result[0].topicName).toBe('core.ingress');
    expect(result[0].errorCode).toBe(0);
    console.log('✅ PENDING Payment sent successfully to core.ingress');
  });

  test('should send EUR payment event to core.ingress', async () => {
    const paymentPayload = {
      res_id: `bkg_${Date.now()}`,
      user_id: `usr_${Date.now()}`,
      amount: 5000,
      currency: "EUR",
      meta: {
        provider: 'Mercado Pago',
        original_status: 'APPROVED',
        payment_intent_id: `pi_${Date.now()}`
      }
    };

    const result = await producer.send({
      topic: 'core.ingress',
      messages: [{
        key: paymentPayload.res_id,
        value: JSON.stringify(paymentPayload),
        headers: {
          'eventType': 'payment.created',
          'eventId': `evt_${Date.now()}`,
          'source': 'payments-svc',
          'timestamp': new Date().toISOString()
        }
      }]
    });
    
    expect(result[0].topicName).toBe('core.ingress');
    expect(result[0].errorCode).toBe(0);
    console.log('✅ EUR Payment sent successfully to core.ingress');
  });
});