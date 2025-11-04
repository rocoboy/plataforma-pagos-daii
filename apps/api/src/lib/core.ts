
import {
  KafkaEventEnvelope,
  kafkaEventEnvelopeSchema,
  PaymentStatusUpdatedData,
  paymentStatusUpdatedDataSchema,
} from "@plataforma/types/kafka-events";


/**
 * Generic function to publish events to Kafka
 * @param data - The event data to publish (plain object, no envelope)
 * @param topic - The Kafka topic to publish to (default: 'payments.events')
 * @returns Promise<void>
 */
export async function publishEvent<TEvent extends KafkaEventEnvelope>(
  event: TEvent,
  topic: string = "core.ingress"
): Promise<void> {
  try {
    if (!process.env.KAFKA_BASE_URL || !process.env.KAFKA_API_KEY) {
      throw new Error("KAFKA_BASE_URL and KAFKA_API_KEY must be set");
    }

    const url = new URL("/events", process.env.KAFKA_BASE_URL);

    const controller = new AbortController();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "kafka-bridge/1.0",
        "X-API-Key": process.env.KAFKA_API_KEY,
        "X-Message-ID": event.messageId,
        "X-Event-Type": event.eventType,
      },
      body: JSON.stringify(event),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    console.log(
      `✅ Webhook delivered successfully to ${url} (status: ${response.status})`
    );

    console.log(`✅ Published event to topic ${topic}`);
  } catch (error) {
    console.error(`❌ Failed to publish event:`, error);
    throw error;
  }
}

export async function publishPaymentStatusUpdated(
  data: PaymentStatusUpdatedData,
  producer: string = "payments-api",
  schemaVersion: string = "1.0"
): Promise<void> {
  const payload = paymentStatusUpdatedDataSchema.parse(data);
  const now = new Date().toISOString();

  const correlationId = `corr-${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
  const idempotencyKey = `idemp-${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
  const eventId = `msg-${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;

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
