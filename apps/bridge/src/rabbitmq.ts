import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { appConfig } from './config';
import type { RabbitMQMessage } from './types';

export class RabbitMQClient {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    try {
      console.log('Connecting to RabbitMQ...');
      this.connection = await amqp.connect(appConfig.rabbitmq.url);
      this.channel = await this.connection.createChannel();
      
      // Declare queue
      await this.channel.assertQueue(appConfig.rabbitmq.queue, {
        durable: true,
      });

      // Declare exchange
      await this.channel.assertExchange(appConfig.rabbitmq.exchange, 'topic', {
        durable: true,
      });

      // Bind queue to exchange
      await this.channel.bindQueue(
        appConfig.rabbitmq.queue,
        appConfig.rabbitmq.exchange,
        '#'
      );

      this.isConnected = true;
      console.log('Connected to RabbitMQ successfully');

      // Handle connection close
      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed');
        this.isConnected = false;
      });

      this.connection.on('error', (err) => {
        console.error('RabbitMQ connection error:', err);
        this.isConnected = false;
      });

    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async consume(
    onMessage: (message: RabbitMQMessage) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ');
    }

    console.log(`Starting to consume from queue: ${appConfig.rabbitmq.queue}`);

    await this.channel.consume(
      appConfig.rabbitmq.queue,
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const message: RabbitMQMessage = {
            content: JSON.parse(msg.content.toString()),
            routingKey: msg.fields.routingKey,
            exchange: msg.fields.exchange,
            timestamp: new Date(),
            messageId: msg.properties.messageId || `msg_${Date.now()}`,
            headers: msg.properties.headers,
          };

          await onMessage(message);
          
          // Acknowledge message
          this.channel!.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          // Reject and requeue message
          this.channel!.nack(msg, false, true);
        }
      },
      { noAck: false }
    );
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.isConnected = false;
    console.log('RabbitMQ connection closed');
  }

  get connected(): boolean {
    return this.isConnected;
  }
}
