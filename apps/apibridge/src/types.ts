export interface KafkaMessage {
  content: any;
  topic: string;
  partition: number;
  offset: string;
  timestamp: Date;
  messageId: string;
  headers?: Record<string, any>;
  key?: string;
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
  kafka: {
    broker: string;
    topics: string[];
    consumerGroup: string;
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
