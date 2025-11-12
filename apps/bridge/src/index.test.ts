import { BridgeService } from './index';

// Mock Bun
const mockServer = {
  stop: jest.fn(),
};

global.Bun = {
  serve: jest.fn(() => mockServer),
} as any;

// Mock dependencies
const mockKafkaClient = {
  connect: jest.fn().mockResolvedValue(undefined),
  consume: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
};

const mockWebhookHandler = {
  sendWebhook: jest.fn().mockResolvedValue({ success: true }),
};

jest.mock('./kafka', () => ({
  KafkaClient: jest.fn(() => mockKafkaClient),
}));

jest.mock('./webhook', () => ({
  WebhookHandler: jest.fn(() => mockWebhookHandler),
}));

jest.mock('./config', () => ({
  appConfig: {
    kafka: {
      broker: 'localhost:9092',
      topics: ['test-topic'],
      consumerGroup: 'test-group',
    },
    webhook: {
      baseUrl: 'http://localhost:3000',
      timeout: 30000,
      maxRetries: 3,
    },
    server: {
      port: 8080,
      host: '0.0.0.0',
    },
  },
}));

describe('BridgeService', () => {
  let bridgeService: any;
  const originalProcessExit = process.exit;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    process.exit = jest.fn() as any;
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Import fresh to get new instance
    jest.resetModules();
    const { BridgeService: Service } = require('./index');
    bridgeService = new Service();
  });

  afterEach(() => {
    process.exit = originalProcessExit;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('constructor', () => {
    it('should create BridgeService with KafkaClient and WebhookHandler', () => {
      expect(bridgeService).toBeDefined();
      expect(mockKafkaClient).toBeDefined();
      expect(mockWebhookHandler).toBeDefined();
    });
  });

  describe('start', () => {
    it('should start HTTP server and connect to Kafka', async () => {
      await bridgeService.start();

      expect(global.Bun.serve).toHaveBeenCalled();
      expect(mockKafkaClient.connect).toHaveBeenCalled();
      expect(mockKafkaClient.consume).toHaveBeenCalled();
    });

    it('should handle health check requests', async () => {
      await bridgeService.start();

      const serveCall = (global.Bun.serve as jest.Mock).mock.calls[0][0];
      const healthResponse = serveCall.fetch(new Request('http://localhost:8080/health'));

      expect(healthResponse).toBeInstanceOf(Response);
    });

    it('should handle non-health check requests with 404', async () => {
      await bridgeService.start();

      const serveCall = (global.Bun.serve as jest.Mock).mock.calls[0][0];
      const response = await serveCall.fetch(new Request('http://localhost:8080/other'));

      expect(response.status).toBe(404);
    });

    it('should process messages through webhook handler', async () => {
      await bridgeService.start();

      // Get the consume callback
      const consumeCallback = mockKafkaClient.consume.mock.calls[0][0];
      
      const mockMessage = {
        messageId: 'msg-123',
        topic: 'test-topic',
        partition: 0,
        content: {
          eventType: 'reservations.reservation.created',
          payload: JSON.stringify({ test: 'data' }),
        },
      };

      await consumeCallback(mockMessage);

      expect(mockWebhookHandler.sendWebhook).toHaveBeenCalledWith(mockMessage);
    });

    it('should handle webhook handler returning undefined', async () => {
      mockWebhookHandler.sendWebhook.mockResolvedValueOnce(undefined);
      
      await bridgeService.start();

      const consumeCallback = mockKafkaClient.consume.mock.calls[0][0];
      const mockMessage = {
        messageId: 'msg-123',
        topic: 'test-topic',
        partition: 0,
        content: {
          eventType: 'payments.payment.status_updated',
          payload: JSON.stringify({ test: 'data' }),
        },
      };

      await consumeCallback(mockMessage);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Message processed but is not relevent topic')
      );
    });

    it('should handle webhook handler errors', async () => {
      const error = new Error('Webhook failed');
      mockWebhookHandler.sendWebhook.mockRejectedValueOnce(error);
      
      await bridgeService.start();

      const consumeCallback = mockKafkaClient.consume.mock.calls[0][0];
      const mockMessage = {
        messageId: 'msg-123',
        topic: 'test-topic',
        partition: 0,
        content: {
          eventType: 'reservations.reservation.created',
          payload: JSON.stringify({ test: 'data' }),
        },
      };

      await expect(consumeCallback(mockMessage)).rejects.toThrow('Webhook failed');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to process message msg-123:'),
        error
      );
    });

    it('should exit on start error', async () => {
      mockKafkaClient.connect.mockRejectedValueOnce(new Error('Connection failed'));

      await bridgeService.start();

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to start bridge service:'),
        expect.any(Error)
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('stop', () => {
    it('should stop server and close Kafka connection', async () => {
      await bridgeService.start();
      await bridgeService.stop();

      expect(mockServer.stop).toHaveBeenCalled();
      expect(mockKafkaClient.close).toHaveBeenCalled();
    });

    it('should handle stop when server is not started', async () => {
      await bridgeService.stop();

      expect(mockKafkaClient.close).toHaveBeenCalled();
    });
  });
});

