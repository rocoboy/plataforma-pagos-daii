import { appConfig } from './config';
import type { KafkaMessage } from './types';
import { RELEVANT_EVENTS, type RelevantEvents, createPaymentBodySchema, updatePaymentBodySchema } from '@plataforma/types';
import { z } from 'zod';
// Define el tipo para el payload que espera el webhook (basado en el cURL)
interface WebhookApiPayload {
  messageId: string;
  eventType: string;
  schemaVersion: string;
  occurredAt: string;
  producer: string;
  correlationId?: string;
  idempotencyKey?: string;
  payload: string; // El payload es un JSON stringificado
}

type CreatePaymentPayload = z.infer<typeof createPaymentBodySchema>;

type UpdatePaymentPayload = z.infer<typeof updatePaymentBodySchema>;

export class WebhookHandler {
  // BORRAMOS getEndpoint. Ya no es necesario, la URL siempre es la misma.

  async sendWebhook(message: KafkaMessage): Promise<void> {
    // 1. Extraer el tipo de evento (CORREGIDO)
    const eventType = this.extractEventType(message);

    if (!eventType) {
      console.warn(`❌ Event type not found in message:`, message);
      return
    }

    if (eventType === 'reservations.reservation.created') {
      const response = await this.publishCreatePaymentWebhook(message.content);
      console.log('Create payment webhook response:', response);
      return response;
    }

    if (eventType === 'reservations.reservation.updated') {
      const response = await this.publishUpdatePaymentWebhook(message.content);
      console.log('Update payment webhook response:', response);
      return response;
    }
  }

  private async publishCreatePaymentWebhook(payload: CreatePaymentPayload) {

    const response = await fetch(`${appConfig.webhook.baseUrl}/api/webhooks/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to publish create payment webhook: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Create payment webhook response:', data);

    return data;
  }

  private async publishUpdatePaymentWebhook(payload: UpdatePaymentPayload) {

    const response = await fetch(`${appConfig.webhook.baseUrl}/api/webhooks/payments`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to publish update payment webhook: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('Update payment webhook response:', data);

    return data;
  }

  private extractEventType(message: KafkaMessage): RelevantEvents | undefined {
    if (message.content && message.content.eventType && RELEVANT_EVENTS.includes(message.content.eventType as RelevantEvents)) {
      if (message.content.eventType === 'payments.payment.status_updated') {
        return undefined;
      }
      return message.content.eventType as RelevantEvents;
    }
    return undefined;
  }

}

