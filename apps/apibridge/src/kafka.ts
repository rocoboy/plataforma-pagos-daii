import { Kafka, Consumer, EachMessagePayload, KafkaMessage } from 'kafkajs';
import { appConfig } from './config';
import type { KafkaMessage as CustomKafkaMessage } from './types';

export class KafkaClient {
  private kafka: Kafka;
  private consumer: Consumer | null = null;
  private isConnected = false;
  private connectedTopics: string[] = [];

  constructor() {
    this.kafka = new Kafka({
      clientId: 'bridge-service',
      brokers: [appConfig.kafka.broker],
      connectionTimeout: 3000,
      requestTimeout: 25000,
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });
  }

  async connect(): Promise<void> {
    try {
      console.log('Connecting to Kafka...');
      
      this.consumer = this.kafka.consumer({ 
        groupId: appConfig.kafka.consumerGroup,
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
        maxBytesPerPartition: 1048576, // 1MB
        allowAutoTopicCreation: false
      });

      await this.consumer.connect();
      console.log('✅ Successfully connected to Kafka broker');
      
      // Subscribe to the configured topics with individual error handling
      const successfulTopics: string[] = [];
      const failedTopics: string[] = [];
      
      for (const topic of appConfig.kafka.topics) {
        try {
          await this.consumer.subscribe({ 
            topics: [topic],
            fromBeginning: false 
          });
          successfulTopics.push(topic);
          console.log(`✅ Successfully subscribed to topic: ${topic}`);
        } catch (error) {
          failedTopics.push(topic);
          console.warn(`⚠️  Failed to subscribe to topic ${topic}:`, error);
        }
      }

      if (successfulTopics.length > 0) {
        this.isConnected = true;
        this.connectedTopics = successfulTopics;
        console.log(`🎉 Kafka connection established successfully`);
        console.log(`📊 Connected topics: ${successfulTopics.join(', ')}`);
        if (failedTopics.length > 0) {
          console.log(`⚠️  Failed topics: ${failedTopics.join(', ')}`);
        }
      } else {
        throw new Error(`Failed to subscribe to any topics. All topics failed: ${failedTopics.join(', ')}`);
      }

    } catch (error) {
      console.error('❌ Failed to connect to Kafka:', error);
      throw error;
    }
  }

  async consume(
    onMessage: (message: CustomKafkaMessage) => Promise<void>
  ): Promise<void> {
    if (!this.consumer) {
      throw new Error('Not connected to Kafka');
    }

    console.log(`🚀 Starting to consume from connected topics: ${this.connectedTopics.join(', ')}`);

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const { topic, partition, message } = payload;
        
        // Only process messages from successfully connected topics
        if (!this.connectedTopics.includes(topic)) {
          console.warn(`⚠️  Received message from unconnected topic: ${topic}, skipping...`);
          return;
        }
        
        try {
          const messageContent = JSON.parse(message.value?.toString() || '{}');
          
          const customMessage: CustomKafkaMessage = {
            content: messageContent,
            topic: topic,
            partition: partition,
            offset: message.offset,
            timestamp: new Date(message.timestamp || Date.now()),
            messageId: message.headers?.['messageId']?.toString() || `msg_${Date.now()}`,
            headers: this.parseHeaders(message.headers || {}),
            key: message.key?.toString(),
          };

          console.log(`📨 Processing message from topic ${topic}, partition ${partition}, offset ${message.offset}`);
          console.log(`📋 Message content:`, JSON.stringify(messageContent, null, 2));
          await onMessage(customMessage);
          
        } catch (error) {
          console.error(`❌ Error processing message from topic ${topic}, partition ${partition}:`, error);
          // Note: Kafka doesn't have nack like RabbitMQ, but we can handle errors differently
          // The message will be automatically retried based on the consumer group settings
          throw error;
        }
      },
    });
  }

  private parseHeaders(headers: Record<string, any>): Record<string, any> {
    const parsedHeaders: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(headers)) {
      if (value) {
        try {
          // Try to parse as JSON first
          parsedHeaders[key] = JSON.parse(value.toString());
        } catch {
          // If not JSON, use as string
          parsedHeaders[key] = value.toString();
        }
      }
    }
    
    return parsedHeaders;
  }

  async close(): Promise<void> {
    if (this.consumer) {
      await this.consumer.disconnect();
    }
    this.isConnected = false;
    console.log('Kafka connection closed');
  }

  get connected(): boolean {
    return this.isConnected;
  }

  // Method to get consumer lag information (useful for monitoring)
  async getConsumerLag(): Promise<any> {
    if (!this.consumer) {
      throw new Error('Not connected to Kafka');
    }

    try {
      const admin = this.kafka.admin();
      await admin.connect();
      
      const groupId = appConfig.kafka.consumerGroup;
      const topics = appConfig.kafka.topics;

      const lag = await admin.fetchOffsets({ groupId, topics });
      await admin.disconnect();
      
      return lag;
    } catch (error) {
      console.error('Error fetching consumer lag:', error);
      return null;
    }
  }
}
