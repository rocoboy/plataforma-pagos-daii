import { KafkaClient } from './kafka';
import { WebhookHandler } from './webhook';
import { appConfig } from './config';

class BridgeService {
  private kafka: KafkaClient;
  private webhookHandler: WebhookHandler;
  private server: any;
  private isHealthy: boolean = false;

  constructor() {
    this.kafka = new KafkaClient();
    this.webhookHandler = new WebhookHandler();
  }

  async start(): Promise<void> {
    try {
      console.log('Starting Kafka to Webhook Bridge Service...');
      console.log('Configuration:', {
        kafka: {
          broker: appConfig.kafka.broker,
          topics: appConfig.kafka.topics,
          consumerGroup: appConfig.kafka.consumerGroup,
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

      // Start HTTP server for health checks
      this.server = Bun.serve({
        port: appConfig.server.port,
        hostname: appConfig.server.host,
        fetch(req) {
          const url = new URL(req.url);
          
          if (url.pathname === '/health') {
            return new Response(JSON.stringify({ 
              status: 'healthy',
              timestamp: new Date().toISOString()
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          return new Response('Not Found', { status: 404 });
        },
      });

      console.log(`HTTP server started on ${appConfig.server.host}:${appConfig.server.port}`);
      console.log(`Health check available at: http://${appConfig.server.host}:${appConfig.server.port}/health`);

      // Connect to Kafka
      await this.kafka.connect();

      // Start consuming messages
      await this.kafka.consume(async (message) => {
        console.log(`Processing message: ${message.messageId} (topic: ${message.topic}, partition: ${message.partition})`);

        try {
          const response = await this.webhookHandler.sendWebhook(message);

          if (response !== undefined) {
            console.log(`Successfully processed message: ${message.messageId}`);
          } else {
            console.log(`Message processed but is not relevent topic: ${message.topic}`  );
          }
        } catch (error) {
          console.error(`Failed to process message ${message.messageId}:`, error);
          throw error;
        }
      });

      this.isHealthy = true;
      console.log('Bridge service started successfully');

    } catch (error) {
      console.error('Failed to start bridge service:', error);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    console.log('Stopping bridge service...');
    this.isHealthy = false;
    
    if (this.server) {
      this.server.stop();
    }
    
    await this.kafka.close();
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
