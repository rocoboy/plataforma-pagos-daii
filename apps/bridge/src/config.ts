import { config } from 'dotenv';
import type { Config } from './types';

config();

export const appConfig: Config = {
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672/',
    queue: process.env.RABBITMQ_QUEUE || 'payment-events',
    exchange: process.env.RABBITMQ_EXCHANGE || 'payments',
  },
  webhook: {
    baseUrl: process.env.WEBHOOK_BASE_URL || 'http://localhost:3000/api/webhooks',
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
