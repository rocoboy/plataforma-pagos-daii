import { appConfig } from './config';
// Asegúrate de que 'KafkaMessage' esté bien definido.
// Asumo que es algo como: type KafkaMessage = { content: WebhookApiPayload };
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

  async sendWebhook(message: KafkaMessage): Promise<void> {
    // 1. Extraer el tipo de evento
    const eventType = this.extractEventType(message);

    if (!eventType) {
      console.warn(`❌ Event type not found in message:`, message);
      return;
    }

    // --- INICIO DE LA CORRECCIÓN ---

    // 2. Extraer el payload interno (que es un string)
    const innerPayloadString = message.content.payload;
    if (!innerPayloadString) {
      console.error('❌ Inner payload string is missing from message content', message);
      return;
    }

    let innerPayload: any;
    try {
      // 3. Parsear el string para obtener el objeto JSON
      innerPayload = JSON.parse(innerPayloadString);
    } catch (error) {
      console.error('❌ Failed to parse inner payload JSON:', innerPayloadString, error);
      return;
    }

    // 4. Pasar el objeto parseado (innerPayload) a las funciones
    if (eventType === 'reservations.reservation.created') {
      // Ahora se pasa el payload correcto
      const response = await this.publishCreatePaymentWebhook(innerPayload);
      console.log('Create payment webhook response:', response);
      return response;
    }

    if (eventType === 'reservations.reservation.updated') {
      // Ahora se pasa el payload correcto
      const response = await this.publishUpdatePaymentWebhook(innerPayload);
      console.log('Update payment webhook response:', response);
      return response;
    }
    // --- FIN DE LA CORRECCIÓN ---
  }

  private async publishCreatePaymentWebhook(payload: CreatePaymentPayload) {
    // Este método estaba bien
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
    // Este método estaba bien
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
    // Este método estaba bien
    if (message.content && message.content.eventType && RELEVANT_EVENTS.includes(message.content.eventType as RelevantEvents)) {
      if (message.content.eventType === 'payments.payment.status_updated') {
        return undefined;
      }
      return message.content.eventType as RelevantEvents;
    }
    return undefined;
  }
}