import { Kafka, Producer } from 'kafkajs';
import {
  KafkaEventEnvelope,
  kafkaEventEnvelopeSchema,
  PaymentStatusUpdatedData,
  paymentStatusUpdatedDataSchema,
} from "@plataforma/types/kafka-events";

// --- Inicio: Configuración del Productor de Kafka (Singleton) ---

let kafka: Kafka | null = null;
let producer: Producer | null = null;

/**
 * Obtiene la instancia de Kafka (singleton)
 */
function getKafkaInstance(): Kafka {
  if (!process.env.KAFKA_BROKER) {
    throw new Error("KAFKA_BROKER environment variable is not set");
  }

  if (!kafka) {
    console.log(`Initializing Kafka client for broker: ${process.env.KAFKA_BROKER}`);
    kafka = new Kafka({
      clientId: 'payments-api-producer', // ID único para este productor
      brokers: [process.env.KAFKA_BROKER],
    });
  }
  return kafka;
}

/**
 * Obtiene el productor de Kafka (singleton) y se asegura de que esté conectado.
 */
async function getProducer(): Promise<Producer> {
  if (!producer) {
    console.log('Creating new Kafka producer...');
    const kafkaInstance = getKafkaInstance();
    producer = kafkaInstance.producer();
    await producer.connect();
    console.log('Kafka producer connected successfully.');

    // Manejar desconexión (importante en un servidor real)
    producer.on('producer.disconnect', () => {
      console.warn('Kafka producer disconnected. Will attempt to reconnect on next publish.');
      producer = null; // Forza a recrear en la próxima llamada
    });
  }
  return producer;
}

// --- Fin: Configuración del Productor ---


/**
 * Generic function to publish events to Kafka (AHORA USA KAFKAJS)
 * @param event - The event envelope to publish
 * @param topic - The Kafka topic to publish to
 * @returns Promise<void>
 */
export async function publishEvent<TEvent extends KafkaEventEnvelope>(
  event: TEvent,
  topic: string = "core.ingress" // Respetamos tu lógica de enrutamiento
): Promise<void> {
  try {
    // 1. Verificar la variable de entorno correcta
    if (!process.env.KAFKA_BROKER) {
      throw new Error("KAFKA_BROKER must be set");
    }

    // 2. Obtener el productor conectado
    const kafkaProducer = await getProducer();

    // 3. Enviar el evento usando producer.send()
    await kafkaProducer.send({
      topic: topic,
      messages: [
        {
          // Usamos el messageId como 'key' para particionamiento consistente
          key: event.messageId,
          // El 'value' es el evento completo stringificado
          value: JSON.stringify(event),
          headers: {
            'eventType': event.eventType,
            'producer': event.producer,
          }
        },
      ],
    });

    console.log(
      `✅ Kafka event '${event.eventType}' published successfully to topic '${topic}'`
    );
  } catch (error) {
    console.error(`❌ Failed to publish Kafka event:`, error);
    // Si falla, resetea el productor para forzar reconexión
    if (producer) {
      await producer.disconnect().catch(() => {});
      producer = null;
    }
    throw error;
  }
}

/**
 * Esta función no necesita cambios.
 * Construye el evento y llama a publishEvent (que ahora está corregido).
 */
export async function publishPaymentStatusUpdated(
  data: PaymentStatusUpdatedData,
  producer: string = "payments-api",
  schemaVersion: string = "1.0"
): Promise<void> {
  const payload = paymentStatusUpdatedDataSchema.parse(data);

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