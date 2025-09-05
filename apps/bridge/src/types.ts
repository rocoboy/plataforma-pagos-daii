export interface RabbitMQMessage {
  content: any;
  routingKey: string;
  exchange: string;
  timestamp: Date;
  messageId: string;
  headers?: Record<string, any>;
}

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: Date;
  messageId: string;
  source: string;
  headers?: Record<string, any>;
}

export interface WebhookResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface Config {
  rabbitmq: {
    url: string;
    queue: string;
    exchange: string;
  };
  webhook: {
    baseUrl: string;
    timeout: number;
    maxRetries: number;
    retryDelay: number;
  };
  server: {
    port: number;
    host: string;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}
