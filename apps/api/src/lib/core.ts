import {
  KafkaEventEnvelope,
  kafkaEventEnvelopeSchema,
  PaymentStatusUpdatedData,
  paymentStatusUpdatedDataSchema,
} from "@plataforma/types/kafka-events";


const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic function to publish events to Kafka via HTTP Bridge
 * (Ahora con lógica de reintentos)
 * @param event - The event envelope to publish
 * @param topic - El tópico (aunque el endpoint /events puede ignorarlo)
 * @returns Promise<void>
 */
export async function publishEvent<TEvent extends KafkaEventEnvelope>(
  event: TEvent,
  topic: string 
): Promise<void> {
  
  const MAX_RETRIES = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (!process.env.KAFKA_BASE_URL || !process.env.KAFKA_API_KEY) {
        throw new Error("KAFKA_BASE_URL and KAFKA_API_KEY must be set");
      }

      const url = new URL("/events", process.env.KAFKA_BASE_URL);

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "payments-api/1.0",
          "X-API-Key": process.env.KAFKA_API_KEY,
          "X-Message-ID": event.messageId,
          "X-Event-Type": event.eventType,
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorText}`);
      }

      console.log(
        `✅ Kafka event '${event.eventType}' published successfully (Attempt ${attempt})`
      );
      return; 

    } catch (error) {
      lastError = error as Error;
      console.warn(
        `❌ Failed to publish event (Attempt ${attempt}/${MAX_RETRIES}):`, 
        lastError.message
      );
      
      if (attempt < MAX_RETRIES) {
        await delay(1000); 
      }
    }
  }

  console.error(`❌ Failed to publish event after ${MAX_RETRIES} attempts.`);
  throw lastError; 
}



export async function publishPaymentStatusUpdated(
  data: PaymentStatusUpdatedData,
  producer: string = "payments-api",
  schemaVersion: string = "1.0"
): Promise<void> {
  const payload = paymentStatusUpdatedDataSchema.parse(data);

  const correlationId = `corr-${Date.now()}`;
  const idempotencyKey = `idemp-${Date.now()}`;
  const eventId = `msg-${Date.now()}`;

  const eventCandidate: KafkaEventEnvelope = {
    messageId: eventId,
    eventType: "payments.payment.status_updated",
    occurredAt: new Date(payload.updatedAt).toISOString(),
    correlationId: correlationId,
    idempotencyKey: idempotencyKey,
    producer: producer,
    schemaVersion: schemaVersion,
    payload: JSON.stringify(payload),
  };

  const event = kafkaEventEnvelopeSchema.parse(eventCandidate);
  
  await publishEvent(event, "core.ingress");
}