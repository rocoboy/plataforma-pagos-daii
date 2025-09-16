import { appConfig } from './config';
import type { RabbitMQMessage, WebhookPayload, WebhookResponse } from './types';

export class WebhookHandler {
  private getEndpoint(eventType: string): string {
    // Map RabbitMQ routing keys to webhook endpoints
    const endpointMap: Record<string, string> = {
      'payment.completed': 'payments',
      'payment.failed': 'payments',
      'payment.refunded': 'payments',
      'payment.pending': 'payments',
      'user.created': 'users',
      'user.updated': 'users',
      'user.deleted': 'users',
      'subscription.created': 'subscriptions',
      'subscription.updated': 'subscriptions',
      'subscription.cancelled': 'subscriptions',
      'subscription.renewed': 'subscriptions',
      'invoice.created': 'invoices',
      'invoice.paid': 'invoices',
      'invoice.overdue': 'invoices',
    };

    return endpointMap[eventType] || 'events';
  }

  async sendWebhook(message: RabbitMQMessage): Promise<void> {
    const payload: WebhookPayload = {
      event: message.routingKey,
      data: message.content,
      timestamp: message.timestamp,
      messageId: message.messageId,
      source: 'rabbitmq',
      headers: message.headers,
    };

    await this.sendWithRetry(payload);
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
          'User-Agent': 'rabbitmq-bridge/1.0',
          'X-Message-ID': payload.messageId,
          'X-Event-Type': payload.event,
          'X-Source': payload.source,
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
