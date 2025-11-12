import { WebhookHandler } from './webhook';
import { appConfig } from './config';
import type { KafkaMessage } from './types';

// Mock fetch
global.fetch = jest.fn();

// Mock @plataforma/types
jest.mock('@plataforma/types', () => ({
  RELEVANT_EVENTS: [
    'reservations.reservation.created',
    'reservations.reservation.updated',
    'payments.payment.status_updated',
  ],
  createPaymentBodySchema: {
    parse: jest.fn((data) => data),
  },
  updatePaymentBodySchema: {
    parse: jest.fn((data) => data),
  },
}));

describe('WebhookHandler', () => {
  let webhookHandler: WebhookHandler;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    jest.clearAllMocks();
    webhookHandler = new WebhookHandler();
    console.warn = jest.fn();
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  describe('sendWebhook', () => {
    it('should return undefined when event type is not found', async () => {
      const message: KafkaMessage = {
        content: { eventType: 'unknown.event' },
        topic: 'test-topic',
        partition: 0,
        offset: '123',
        timestamp: new Date(),
        messageId: 'msg-123',
      };

      const result = await webhookHandler.sendWebhook(message);

      expect(result).toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('❌ Event type not found in message:'),
        message
      );
    });

    it('should return undefined when payload is missing', async () => {
      const message: KafkaMessage = {
        content: {
          eventType: 'reservations.reservation.created',
        },
        topic: 'test-topic',
        partition: 0,
        offset: '123',
        timestamp: new Date(),
        messageId: 'msg-123',
      };

      const result = await webhookHandler.sendWebhook(message);

      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('❌ Inner payload string is missing'),
        message
      );
    });

    it('should return undefined when payload JSON is invalid', async () => {
      const message: KafkaMessage = {
        content: {
          eventType: 'reservations.reservation.created',
          payload: 'invalid json',
        },
        topic: 'test-topic',
        partition: 0,
        offset: '123',
        timestamp: new Date(),
        messageId: 'msg-123',
      };

      const result = await webhookHandler.sendWebhook(message);

      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('❌ Failed to parse inner payload JSON:'),
        'invalid json',
        expect.any(Error)
      );
    });

    it('should handle reservations.reservation.created event', async () => {
      const innerPayload = {
        reservationId: 'res-123',
        userId: 'user-456',
        amount: 1000,
        currency: 'ARS',
        flightId: 'flight-789',
        reservedAt: new Date().toISOString(),
      };

      const message: KafkaMessage = {
        content: {
          eventType: 'reservations.reservation.created',
          payload: JSON.stringify(innerPayload),
        },
        topic: 'test-topic',
        partition: 0,
        offset: '123',
        timestamp: new Date(),
        messageId: 'msg-123',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await webhookHandler.sendWebhook(message);

      expect(global.fetch).toHaveBeenCalledWith(
        `${appConfig.webhook.baseUrl}/api/webhooks/payments`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            res_id: 'res-123',
            user_id: 'user-456',
            amount: 1000,
            currency: 'ARS',
            meta: {
              flightId: 'flight-789',
              reservedAt: innerPayload.reservedAt,
            },
          }),
        })
      );
      expect(result).toBeDefined();
    });

    it('should handle reservations.reservation.updated event', async () => {
      const innerPayload = {
        id: 'pay-123',
        status: 'COMPLETED',
      };

      const message: KafkaMessage = {
        content: {
          eventType: 'reservations.reservation.updated',
          payload: JSON.stringify(innerPayload),
        },
        topic: 'test-topic',
        partition: 0,
        offset: '123',
        timestamp: new Date(),
        messageId: 'msg-123',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await webhookHandler.sendWebhook(message);

      expect(global.fetch).toHaveBeenCalledWith(
        `${appConfig.webhook.baseUrl}/api/webhooks/payments`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(innerPayload),
        })
      );
      expect(result).toBeDefined();
    });

    it('should return undefined for payments.payment.status_updated event', async () => {
      const message: KafkaMessage = {
        content: {
          eventType: 'payments.payment.status_updated',
          payload: JSON.stringify({ test: 'data' }),
        },
        topic: 'test-topic',
        partition: 0,
        offset: '123',
        timestamp: new Date(),
        messageId: 'msg-123',
      };

      const result = await webhookHandler.sendWebhook(message);

      expect(result).toBeUndefined();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle webhook fetch errors', async () => {
      const innerPayload = {
        reservationId: 'res-123',
        userId: 'user-456',
        amount: 1000,
        currency: 'ARS',
      };

      const message: KafkaMessage = {
        content: {
          eventType: 'reservations.reservation.created',
          payload: JSON.stringify(innerPayload),
        },
        topic: 'test-topic',
        partition: 0,
        offset: '123',
        timestamp: new Date(),
        messageId: 'msg-123',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(webhookHandler.sendWebhook(message)).rejects.toThrow(
        'Failed to publish create payment webhook: Internal Server Error'
      );
    });
  });
});

