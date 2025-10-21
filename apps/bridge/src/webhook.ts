import { appConfig } from './config';
import type { KafkaMessage, WebhookPayload, WebhookResponse } from './types';

export class WebhookHandler {
  private getEndpoint(eventType: string): string {
    // Map team's event types to webhook endpoints
    const endpointMap: Record<string, string> = {
      'flights.flight.created': 'flights',
      'flights.flight.updated': 'flights',
      'flights.flight.cancelled': 'flights',
      'reservations.reservation.created': 'reservations',
      'reservations.reservation.updated': 'reservations',
      'reservations.reservation.cancelled': 'reservations',
      'payments.payment.completed': 'payments',
      'payments.payment.failed': 'payments',
      'payments.payment.refunded': 'payments',
      'payments.payment.updated': 'payments',
      'users.user.created': 'users',
      'users.user.updated': 'users',
      'users.user.deleted': 'users',
      'search.search.performed': 'search',
      'metrics.metric.recorded': 'metrics',
      'core.system.event': 'events',
    };

    return endpointMap[eventType] || 'events';
  }

  async sendWebhook(message: KafkaMessage): Promise<void> {
    // Extract event type from topic or message content
    const eventType = this.extractEventType(message);
    
    // Build payload following team's format only
    const payload: WebhookPayload = {
      event: eventType,
      data: message.content?.payload || message.content, // Use payload field (team's format)
      timestamp: message.timestamp,
      messageId: message.messageId,
      source: 'kafka',
      headers: {
        ...message.headers,
        'kafka-topic': message.topic,
        'kafka-partition': message.partition.toString(),
        'kafka-offset': message.offset,
        'kafka-key': message.key || '',
        // Include team's standard fields
        ...(message.content?.schema_version && { 'schema-version': message.content.schema_version }),
        ...(message.content?.event_type && { 'event-type': message.content.event_type }),
      },
    };

    await this.sendWithRetry(payload);
  }

  private extractEventType(message: KafkaMessage): string {
    // Only support team's standard message format
    if (message.content && message.content.event_type) {
      return message.content.event_type;
    }
    
    // If no event_type, use topic-based fallback
    const topicEventMap: Record<string, string> = {
      'payments.events': 'payments.payment.updated',
      'users.events': 'users.user.updated',
      'flights.events': 'flights.flight.updated',
      'reservations.events': 'reservations.reservation.updated',
      'search.events': 'search.search.performed',
      'metrics.events': 'metrics.metric.recorded',
      'core.ingress': 'core.system.event',
    };
    
    return topicEventMap[message.topic] || 'unknown.event';
  }

  private async sendWithRetry(payload: WebhookPayload): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= appConfig.webhook.maxRetries; attempt++) {
      if (attempt > 0) {
        console.warn(`Retrying webhook delivery (attempt ${attempt + 1}/${appConfig.webhook.maxRetries + 1})`);
        await this.sleep(appConfig.webhook.retryDelay);
      }

      try {
        await this.send(payload);
        if (attempt > 0) {
          console.log(`Webhook delivered successfully after ${attempt} retries`);
        }
        return;
      } catch (error) {
        lastError = error as Error;
        console.error(`Webhook delivery failed (attempt ${attempt + 1}/${appConfig.webhook.maxRetries + 1}):`, error);
      }
    }

    throw new Error(`Webhook delivery failed after ${appConfig.webhook.maxRetries + 1} attempts: ${lastError?.message}`);
  }

  private async send(payload: WebhookPayload): Promise<void> {
    const endpoint = this.getEndpoint(payload.event);
    const url = `${appConfig.webhook.baseUrl}/${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), appConfig.webhook.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'kafka-bridge/1.0',
          'X-Message-ID': payload.messageId,
          'X-Event-Type': payload.event,
          'X-Source': payload.source,
          'X-API-Key': 'microservices-api-key-2024-secure',
          ...(payload.headers && Object.entries(payload.headers).reduce((acc, [key, value]) => {
            acc[`X-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = String(value);
            return acc;
          }, {} as Record<string, string>)),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      console.log(`Webhook delivered successfully to ${url} (status: ${response.status})`);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Webhook request timed out after ${appConfig.webhook.timeout}ms`);
      }
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
