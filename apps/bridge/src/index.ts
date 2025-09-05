import { RabbitMQClient } from './rabbitmq';
import { WebhookHandler } from './webhook';
import { createServer } from './server';
import { appConfig } from './config';

class BridgeService {
  private rabbitmq: RabbitMQClient;
  private webhookHandler: WebhookHandler;
  private server: ReturnType<typeof createServer>;

  constructor() {
    this.rabbitmq = new RabbitMQClient();
    this.webhookHandler = new WebhookHandler();
    this.server = createServer();
  }

  async start(): Promise<void> {
    try {
      console.log('Starting RabbitMQ to Webhook Bridge Service...');
      console.log('Configuration:', {
        rabbitmq: {
          url: appConfig.rabbitmq.url.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
          queue: appConfig.rabbitmq.queue,
          exchange: appConfig.rabbitmq.exchange,
        },
        webhook: {
          baseUrl: appConfig.webhook.baseUrl,
          timeout: appConfig.webhook.timeout,
          maxRetries: appConfig.webhook.maxRetries,
        },
        server: {
          port: appConfig.server.port,
          host: appConfig.server.host,
        },
      });
      
      // Connect to RabbitMQ
      await this.rabbitmq.connect();
      
      // Start consuming messages
      await this.rabbitmq.consume(async (message) => {
        console.log(`Processing message: ${message.messageId} (routing key: ${message.routingKey})`);
        
        try {
          await this.webhookHandler.sendWebhook(message);
          console.log(`Successfully processed message: ${message.messageId}`);
        } catch (error) {
          console.error(`Failed to process message ${message.messageId}:`, error);
          throw error; // This will cause the message to be nacked and requeued
        }
      });

      console.log('Bridge service started successfully');
      console.log(`Health check available at: http://${appConfig.server.host}:${appConfig.server.port}/health`);
      
    } catch (error) {
      console.error('Failed to start bridge service:', error);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    console.log('Stopping bridge service...');
    await this.rabbitmq.close();
    this.server.stop();
    console.log('Bridge service stopped');
  }
}

// Create and start the service
const bridgeService = new BridgeService();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await bridgeService.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await bridgeService.stop();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the service
bridgeService.start().catch((error) => {
  console.error('Failed to start service:', error);
  process.exit(1);
});
