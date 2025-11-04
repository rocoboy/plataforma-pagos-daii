import { Kafka, Producer, Partitioners } from "kafkajs";
import {
  KafkaEventEnvelope,
  kafkaEventEnvelopeSchema,
  PaymentStatusUpdatedData,
  paymentStatusUpdatedDataSchema,
} from "@plataforma/types/kafka-events";

// Kafka client singleton
let kafkaInstance: Kafka | null = null;
let producerInstance: Producer | null = null;

async function getKafkaProducer(): Promise<Producer> {
  if (!kafkaInstance) {
    const broker = process.env.KAFKA_BROKER || "34.172.179.60:9094";

    kafkaInstance = new Kafka({
      clientId: "payments-api",
      brokers: [broker],
      connectionTimeout: 3000,
      requestTimeout: 25000,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });
  }

  if (!producerInstance) {
    producerInstance = kafkaInstance.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
    });
    await producerInstance.connect();
  }

  return producerInstance;
}

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
    const producer = await getKafkaProducer();

    await producer.send({
      topic,
      messages: [
        {
          key: event.id,
          value: JSON.stringify(event.payload),
          headers: {
            messageId: event.id,
            eventType: event.eventType,
            schemaVersion: event.schemaVersion,
            producer: event.producer,
            correlationId: event.correlationId,
            idempotencyKey: event.idempotencyKey,
            occurredAt: event.occurredAt,
          },
        },
      ],
    });

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

  const correlationId = `corr_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
  const idempotencyKey = `idemp_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
  const eventId = `msg_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;

  const eventCandidate: KafkaEventEnvelope = {
    id: eventId,
    eventType: "payment.payment.status_updated",
    occurredAt: payload.updatedAt ?? now,
    correlationId: correlationId,
    idempotencyKey: idempotencyKey,
    producer: producer,
    schemaVersion: schemaVersion,
    payload: payload,
  };

  const event = kafkaEventEnvelopeSchema.parse(eventCandidate);
  await publishEvent(event, "core.ingress");
}
