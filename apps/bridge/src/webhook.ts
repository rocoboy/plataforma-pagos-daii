import { appConfig } from './config';
import type { KafkaMessage } from './types';
// Quitamos 'updatePaymentBodySchema' que estaba obsoleto
import { RELEVANT_EVENTS, type RelevantEvents, createPaymentBodySchema } from '@plataforma/types';
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

type UpdatePaymentPayload = {
  res_id: string;
  status: string;
};

export class WebhookHandler {

  async sendWebhook(message: KafkaMessage): Promise<void> {
    // 1. Extraer el tipo de evento
    const eventType = this.extractEventType(message);

    if (!eventType) {
      console.warn(`❌ Event type not found in message:`, message);
      return;
    } 

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

    // --- Lógica de Mapeo y Traducción ---

    if (eventType === 'reservations.reservation.created') {
      
      // Transforma el payload al formato que la API de Pagos espera
      const apiPayload: CreatePaymentPayload = {
        res_id: innerPayload.reservationId, // Mapea reservationId a res_id
        user_id: innerPayload.userId,     // Mapea userId a user_id
        amount: innerPayload.amount,
        currency: innerPayload.currency,
        meta: { 
          // Guarda el resto de datos en meta
          flightId: innerPayload.flightId, 
          reservedAt: innerPayload.reservedAt 
        } 
      };

      const response = await this.publishCreatePaymentWebhook(apiPayload); 
      console.log('Create payment webhook response:', response);
      return response;
    }

    if (eventType === 'reservations.reservation.updated') {
      if (innerPayload.newStatus === 'PENDING') {
         console.log(`⏩ Skipping redundant update to PENDING for ${innerPayload.reservationId}`);
         return;
      }
      // 1. TRADUCE el estado del dominio de "Reservas" al de "Pagos"
      let apiStatus;
      switch (innerPayload.newStatus) {
        case "PENDING_REFUND":
          apiStatus = "REFUND"; //PARA QUE SEA AUTOMATICO Y CHAU 
          break;
        case "PAID":
          apiStatus = "SUCCESS"; 
          break;
        case "CANCELLED":
           apiStatus = "REFUND"; 
           break;
        case "FAILED":
           apiStatus = "FAILURE"; 
           break;
        default:
          apiStatus = innerPayload.newStatus;
      }

      const apiPayload: UpdatePaymentPayload = {
        res_id: innerPayload.reservationId, // <-- Envía res_id
        status: apiStatus,                  // Usa el estado traducido
      };

      // 3. Envía el payload transformado
      const response = await this.publishUpdatePaymentWebhook(apiPayload); 
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

  // Esta función ahora acepta nuestro tipo 'UpdatePaymentPayload' (con res_id)
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