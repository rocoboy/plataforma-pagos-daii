import { appConfig } from './config';
import type { KafkaMessage } from './types';
// Quitamos 'updatePaymentBodySchema' que estaba obsoleto
import { RELEVANT_EVENTS, type RelevantEvents, createPaymentBodySchema } from '@plataforma/types';
import { z } from 'zod';

// Retry configuration
const RETRY_CONFIG = {
  baseDelayMs: 1000, // Start with 1 second
  maxDelayMs: 60000, // Cap at 60 seconds per retry
  maxDurationMs: 240000, // 4 minutes total (middle of 3-5 minutes)
  maxRetries: 10, // Safety limit
};

// Helper function to sleep
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Exponential backoff retry wrapper
async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = Date.now();
  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < RETRY_CONFIG.maxRetries) {
    const elapsedTime = Date.now() - startTime;
    
    // Check if we've exceeded max duration
    if (elapsedTime >= RETRY_CONFIG.maxDurationMs) {
      throw new Error(
        `❌ ${operationName} failed after ${Math.round(elapsedTime / 1000)}s (max duration exceeded). Last error: ${lastError?.message || 'Unknown'}`
      );
    }

    try {
      const result = await fn();
      if (attempt > 0) {
        console.log(`✅ ${operationName} succeeded after ${attempt} retry(ies)`);
      }
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      attempt++;

      // Don't retry if we've exceeded max duration
      const elapsedTimeAfterError = Date.now() - startTime;
      if (elapsedTimeAfterError >= RETRY_CONFIG.maxDurationMs) {
        throw new Error(
          `❌ ${operationName} failed after ${Math.round(elapsedTimeAfterError / 1000)}s (max duration exceeded). Last error: ${lastError.message}`
        );
      }

      // Calculate exponential backoff delay
      const delayMs = Math.min(
        RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt - 1),
        RETRY_CONFIG.maxDelayMs
      );

      // Check if delay would exceed max duration
      if (elapsedTimeAfterError + delayMs >= RETRY_CONFIG.maxDurationMs) {
        throw new Error(
          `❌ ${operationName} failed after ${attempt} attempt(s). Max duration would be exceeded. Last error: ${lastError.message}`
        );
      }

      console.warn(
        `⚠️ ${operationName} failed (attempt ${attempt}/${RETRY_CONFIG.maxRetries}): ${lastError.message}. Retrying in ${Math.round(delayMs / 1000)}s...`
      );

      await sleep(delayMs);
    }
  }

  throw new Error(
    `❌ ${operationName} failed after ${attempt} attempts. Last error: ${lastError?.message || 'Unknown'}`
  );
}

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
    return withExponentialBackoff(async () => {
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
    }, 'Create payment webhook');
  }

  // Esta función ahora acepta nuestro tipo 'UpdatePaymentPayload' (con res_id)
  private async publishUpdatePaymentWebhook(payload: UpdatePaymentPayload) {
    return withExponentialBackoff(async () => {
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
    }, 'Update payment webhook');
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