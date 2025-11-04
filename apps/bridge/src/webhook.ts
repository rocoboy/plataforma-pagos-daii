import { appConfig } from './config';
import type { KafkaMessage } from './types';

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

export class WebhookHandler {
  // BORRAMOS getEndpoint. Ya no es necesario, la URL siempre es la misma.

  async sendWebhook(message: KafkaMessage): Promise<void> {
    // 1. Extraer el tipo de evento (CORREGIDO)
    const eventType = this.extractEventType(message);
    
    // 2. Construir el payload (CORREGIDO para coincidir con el cURL)
    const payload: WebhookApiPayload = {
      // Nombres de campos que el servidor espera:
      messageId: message.messageId,
      eventType: eventType,
      schemaVersion: message.content?.schema_version || "1.0",
      // ARREGLO 1: Usar el timestamp del 'content' que sí es válido, no el del broker.
      occurredAt: message.content?.occurred_at || new Date().toISOString(),
      producer: message.content?.source || 'kafka-bridge',
      correlationId: message.content?.correlation_id,
      idempotencyKey: message.key || message.messageId,
      
      // ARREGLO 2: Buscar el payload anidado 'payment' que el test está enviando.
      payload: JSON.stringify(message.content?.data?.payment || message.content?.data || message.content)
    };

    await this.sendWithRetry(payload);
  }

  private extractEventType(message: KafkaMessage): string {
    // ARREGLO: Buscar 'name' (del test) como fuente principal del evento
    if (message.content && message.content.name) {
      return message.content.name; // Ej: "payment.created"
    }
    // ARREGLO: Buscar 'event_type' como segunda opción
    if (message.content && message.content.event_type) {
      return message.content.event_type;
    }
    
    // Fallback (lógica anterior, por si acaso)
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

  private async sendWithRetry(payload: WebhookApiPayload): Promise<void> {
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

  private async send(payload: WebhookApiPayload): Promise<void> {
    // ARREGLO: La URL es SIEMPRE la base. No se añade nada.
    const url = appConfig.webhook.baseUrl; // Ej: http://34.172.179.60/events

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), appConfig.webhook.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'kafka-bridge/1.0',
          'X-API-Key': 'microservices-api-key-2024-secure',
          'X-Message-ID': payload.messageId,
          'X-Event-Type': payload.eventType, // Enviar header también
        },
        body: JSON.stringify(payload), // El body es el payload de la API, stringificado
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // ¡Este es el log que queremos ver!
      console.log(`✅ Webhook delivered successfully to ${url} (status: ${response.status})`);
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

