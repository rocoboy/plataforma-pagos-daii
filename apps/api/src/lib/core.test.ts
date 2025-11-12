// Mock kafkajs BEFORE importing
jest.mock('kafkajs', () => {
  const mockProducer = {
    connect: jest.fn().mockResolvedValue(undefined),
    send: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  };

  const mockKafka = {
    producer: jest.fn(() => mockProducer),
  };

  return {
    Kafka: jest.fn(() => mockKafka),
    __mockProducer: mockProducer,
    __mockKafka: mockKafka,
  };
});

import type { KafkaEventEnvelope, PaymentStatusUpdatedData } from '@plataforma/types/kafka-events';

describe('core.ts - Kafka Event Publishing', () => {
  const originalEnv = process.env;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  
  // Get mock references
  const kafkajs = require('kafkajs');
  const mockProducer = (kafkajs as any).__mockProducer;
  const mockKafka = (kafkajs as any).__mockKafka;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.KAFKA_BROKER = 'localhost:9092';
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('publishEvent', () => {
    const { publishEvent } = require('./core');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    const mockEvent: KafkaEventEnvelope = {
      messageId: 'msg-123',
      eventType: 'test.event',
      occurredAt: new Date().toISOString(),
      correlationId: 'corr-123',
      idempotencyKey: 'idemp-123',
      producer: 'test-producer',
      schemaVersion: '1.0',
      payload: JSON.stringify({ test: 'data' }),
    };

    it('should publish event successfully', async () => {
      const { Kafka } = require('kafkajs');
      
      await publishEvent(mockEvent, 'test-topic');

      expect(Kafka).toHaveBeenCalled();
      const kafkaInstance = Kafka.mock.results[0].value;
      expect(kafkaInstance.producer).toHaveBeenCalled();
      const producer = kafkaInstance.producer.mock.results[0].value;
      expect(producer.connect).toHaveBeenCalled();
      expect(producer.send).toHaveBeenCalledWith({
        topic: 'test-topic',
        messages: [
          {
            key: 'msg-123',
            value: JSON.stringify(mockEvent),
            headers: {
              eventType: 'test.event',
              producer: 'test-producer',
            },
          },
        ],
      });
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("✅ Kafka event 'test.event' published successfully")
      );
    });

    it('should use default topic "core.ingress" when not provided', async () => {
      await publishEvent(mockEvent);

      expect(mockProducer.send).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'core.ingress',
        })
      );
    });

    it('should throw error when KAFKA_BROKER is not set', async () => {
      const originalBroker = process.env.KAFKA_BROKER;
      delete process.env.KAFKA_BROKER;
      
      // Re-import to get fresh module
      const { publishEvent: publishEventWithoutBroker } = require('./core');
      
      await expect(publishEventWithoutBroker(mockEvent)).rejects.toThrow('KAFKA_BROKER must be set');
      
      // Restore
      process.env.KAFKA_BROKER = originalBroker;
    });
  });

  describe('publishPaymentStatusUpdated', () => {
    const { publishPaymentStatusUpdated } = require('./core');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    const mockPaymentData: PaymentStatusUpdatedData = {
      paymentId: 'pay-123',
      reservationId: 'res-456',
      userId: 'user-789',
      status: 'SUCCESS',
      amount: 1000,
      currency: 'ARS',
      updatedAt: new Date().toISOString(),
    };

    it('should publish payment status updated event', async () => {
      await publishPaymentStatusUpdated(mockPaymentData);

      expect(mockProducer.send).toHaveBeenCalled();
      const sendCall = mockProducer.send.mock.calls[0][0];
      expect(sendCall.topic).toBe('core.ingress');
      expect(sendCall.messages[0].headers.eventType).toBe('payments.payment.status_updated');
    });

    it('should use custom producer name', async () => {
      await publishPaymentStatusUpdated(mockPaymentData, 'custom-producer');

      const sendCall = mockProducer.send.mock.calls[mockProducer.send.mock.calls.length - 1][0];
      const event = JSON.parse(sendCall.messages[0].value);
      expect(event.producer).toBe('custom-producer');
    });

    it('should use custom schema version', async () => {
      await publishPaymentStatusUpdated(mockPaymentData, 'payments-api', '2.0');

      const sendCall = mockProducer.send.mock.calls[mockProducer.send.mock.calls.length - 1][0];
      const event = JSON.parse(sendCall.messages[0].value);
      expect(event.schemaVersion).toBe('2.0');
    });

    it('should parse and validate payment data', async () => {
      const invalidData = { ...mockPaymentData, status: 'INVALID_STATUS' as any };
      
      await expect(publishPaymentStatusUpdated(invalidData)).rejects.toThrow();
    });
  });
});

