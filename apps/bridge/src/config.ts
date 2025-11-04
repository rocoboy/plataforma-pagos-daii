import type { Config } from './types';

export const appConfig: Config = {
  kafka: {
    broker: process.env.KAFKA_BROKER || '34.172.179.60:9094', // Team's broker
    topics: process.env.KAFKA_TOPICS?.split(',') || [
      // Team's specified topics
      'flights.events',
      'reservations.events', 
      'payments.events',
      'users.events',
      'search.events',
      'metrics.events',
      'core.ingress'
    ],
    consumerGroup: process.env.KAFKA_CONSUMER_GROUP || 'bridge-service-group',
  },
  webhook: {
    baseUrl: process.env.WEBHOOK_BASE_URL || 'http://localhost:3000/events', // Team's webhook endpoint
    timeout: parseInt(process.env.WEBHOOK_TIMEOUT || '30000'),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.RETRY_DELAY || '5000'),
  },
  server: {
    port: parseInt(process.env.PORT || '8080'),
    host: process.env.HOST || '0.0.0.0',
  },
  logging: {
    level: (process.env.LOG_LEVEL as any) || 'info',
  },
};
