import { KafkaClient } from './kafka';
import { appConfig } from './config';

// Mock kafkajs
const mockConsumer = {
  connect: jest.fn().mockResolvedValue(undefined),
  subscribe: jest.fn().mockResolvedValue(undefined),
  run: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
};

const mockAdmin = {
  connect: jest.fn().mockResolvedValue(undefined),
  fetchOffsets: jest.fn().mockResolvedValue({}),
  disconnect: jest.fn().mockResolvedValue(undefined),
};

const mockKafka = {
  consumer: jest.fn(() => mockConsumer),
  admin: jest.fn(() => mockAdmin),
};

jest.mock('kafkajs', () => ({
  Kafka: jest.fn(() => mockKafka),
}));

describe('KafkaClient', () => {
  let kafkaClient: KafkaClient;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    kafkaClient = new KafkaClient();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should create Kafka client with correct configuration', () => {
      expect(kafkaClient).toBeInstanceOf(KafkaClient);
      expect(mockKafka).toBeDefined();
    });
  });

  describe('connect', () => {
    it('should connect to Kafka and subscribe to topics', async () => {
      await kafkaClient.connect();

      expect(mockConsumer.connect).toHaveBeenCalled();
      expect(mockConsumer.subscribe).toHaveBeenCalledTimes(appConfig.kafka.topics.length);
      expect(kafkaClient.connected).toBe(true);
    });

    it('should handle partial topic subscription failures', async () => {
      mockConsumer.subscribe
        .mockResolvedValueOnce(undefined) // First topic succeeds
        .mockRejectedValueOnce(new Error('Topic not found')); // Second topic fails

      await kafkaClient.connect();

      expect(kafkaClient.connected).toBe(true);
    });

    it('should throw error if all topics fail', async () => {
      mockConsumer.subscribe.mockRejectedValue(new Error('All topics failed'));

      await expect(kafkaClient.connect()).rejects.toThrow('Failed to subscribe to any topics');
    });

    it('should handle connection errors', async () => {
      mockConsumer.connect.mockRejectedValue(new Error('Connection failed'));

      await expect(kafkaClient.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('consume', () => {
    it('should throw error if not connected', async () => {
      await expect(
        kafkaClient.consume(async () => {})
      ).rejects.toThrow('Not connected to Kafka');
    });

    it('should process messages from connected topics', async () => {
      await kafkaClient.connect();

      const onMessage = jest.fn().mockResolvedValue(undefined);
      
      // Mock the run callback
      let eachMessageCallback: any;
      mockConsumer.run.mockImplementation(({ eachMessage }) => {
        eachMessageCallback = eachMessage;
        return Promise.resolve();
      });

      await kafkaClient.consume(onMessage);

      // Simulate message
      const mockPayload = {
        topic: appConfig.kafka.topics[0],
        partition: 0,
        message: {
          value: Buffer.from(JSON.stringify({ test: 'data' })),
          offset: '123',
          timestamp: Date.now().toString(),
          headers: { messageId: 'msg-123' },
          key: Buffer.from('key'),
        },
      };

      await eachMessageCallback(mockPayload);

      expect(onMessage).toHaveBeenCalled();
      const calledMessage = onMessage.mock.calls[0][0];
      expect(calledMessage.topic).toBe(appConfig.kafka.topics[0]);
      expect(calledMessage.messageId).toBe('msg-123');
    });

    it('should skip messages from unconnected topics', async () => {
      await kafkaClient.connect();

      const onMessage = jest.fn().mockResolvedValue(undefined);
      
      let eachMessageCallback: any;
      mockConsumer.run.mockImplementation(({ eachMessage }) => {
        eachMessageCallback = eachMessage;
        return Promise.resolve();
      });

      await kafkaClient.consume(onMessage);

      const mockPayload = {
        topic: 'unconnected-topic',
        partition: 0,
        message: {
          value: Buffer.from(JSON.stringify({ test: 'data' })),
          offset: '123',
          timestamp: Date.now().toString(),
          headers: {},
        },
      };

      await eachMessageCallback(mockPayload);

      expect(onMessage).not.toHaveBeenCalled();
    });

    it('should handle message processing errors', async () => {
      await kafkaClient.connect();

      const onMessage = jest.fn().mockRejectedValue(new Error('Processing failed'));
      
      let eachMessageCallback: any;
      mockConsumer.run.mockImplementation(({ eachMessage }) => {
        eachMessageCallback = eachMessage;
        return Promise.resolve();
      });

      await kafkaClient.consume(onMessage);

      const mockPayload = {
        topic: appConfig.kafka.topics[0],
        partition: 0,
        message: {
          value: Buffer.from(JSON.stringify({ test: 'data' })),
          offset: '123',
          timestamp: Date.now().toString(),
          headers: {},
        },
      };

      await expect(eachMessageCallback(mockPayload)).rejects.toThrow('Processing failed');
    });

    it('should handle invalid JSON in message value', async () => {
      await kafkaClient.connect();

      const onMessage = jest.fn().mockResolvedValue(undefined);
      
      let eachMessageCallback: any;
      mockConsumer.run.mockImplementation(({ eachMessage }) => {
        eachMessageCallback = eachMessage;
        return Promise.resolve();
      });

      await kafkaClient.consume(onMessage);

      const mockPayload = {
        topic: appConfig.kafka.topics[0],
        partition: 0,
        message: {
          value: Buffer.from('invalid json'),
          offset: '123',
          timestamp: Date.now().toString(),
          headers: {},
        },
      };

      await expect(eachMessageCallback(mockPayload)).rejects.toThrow();
    });
  });

  describe('parseHeaders', () => {
    it('should parse JSON headers', async () => {
      await kafkaClient.connect();

      const onMessage = jest.fn().mockResolvedValue(undefined);
      
      let eachMessageCallback: any;
      mockConsumer.run.mockImplementation(({ eachMessage }) => {
        eachMessageCallback = eachMessage;
        return Promise.resolve();
      });

      await kafkaClient.consume(onMessage);

      const mockPayload = {
        topic: appConfig.kafka.topics[0],
        partition: 0,
        message: {
          value: Buffer.from(JSON.stringify({ test: 'data' })),
          offset: '123',
          timestamp: Date.now().toString(),
          headers: {
            'json-header': Buffer.from(JSON.stringify({ nested: 'value' })),
            'string-header': Buffer.from('simple-value'),
          },
        },
      };

      await eachMessageCallback(mockPayload);

      const calledMessage = onMessage.mock.calls[0][0];
      expect(calledMessage.headers['json-header']).toEqual({ nested: 'value' });
      expect(calledMessage.headers['string-header']).toBe('simple-value');
    });
  });

  describe('close', () => {
    it('should disconnect consumer', async () => {
      await kafkaClient.connect();
      await kafkaClient.close();

      expect(mockConsumer.disconnect).toHaveBeenCalled();
      expect(kafkaClient.connected).toBe(false);
    });

    it('should handle close when not connected', async () => {
      await kafkaClient.close();
      expect(mockConsumer.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('getConsumerLag', () => {
    it('should return consumer lag information', async () => {
      await kafkaClient.connect();
      const lag = await kafkaClient.getConsumerLag();

      expect(mockAdmin.connect).toHaveBeenCalled();
      expect(mockAdmin.fetchOffsets).toHaveBeenCalled();
      expect(mockAdmin.disconnect).toHaveBeenCalled();
      expect(lag).toBeDefined();
    });

    it('should throw error if not connected', async () => {
      await expect(kafkaClient.getConsumerLag()).rejects.toThrow('Not connected to Kafka');
    });

    it('should return null on error', async () => {
      await kafkaClient.connect();
      mockAdmin.fetchOffsets.mockRejectedValue(new Error('Failed to fetch'));

      const lag = await kafkaClient.getConsumerLag();
      expect(lag).toBeNull();
    });
  });
});

