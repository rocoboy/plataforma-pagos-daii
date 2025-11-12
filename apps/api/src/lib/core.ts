import {
  KafkaEventEnvelope,
  kafkaEventEnvelopeSchema,
  PaymentStatusUpdatedData,
  paymentStatusUpdatedDataSchema,
} from "@plataforma/types/kafka-events";


export async function publishEvent<TEvent extends KafkaEventEnvelope>(
  event: TEvent,
  topic: string 
): Promise<void> {
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
      `✅ Kafka event '${event.eventType}' published successfully via HTTP to ${url}`
    );

  } catch (error) {
    console.error(`❌ Failed to publish event via HTTP:`, error);
    throw error;
  }
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