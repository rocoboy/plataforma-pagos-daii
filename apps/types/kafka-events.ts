import { z } from "zod";
import { PaymentStatusEnum } from "./payments";

// Payment Status Updated payload schema - matches the JSON schema exactly
export const paymentStatusUpdatedDataSchema = z.object({
    paymentId: z.string(),
    reservationId: z.string(),
    userId: z.string().optional().nullable(),
    status: PaymentStatusEnum,
    amount: z.number(),
    currency: z.string().length(3),
    updatedAt: z.iso.datetime(),
  }).strict(); // additionalProperties: false
  

// Base schema for Kafka event envelopes
export const kafkaEventEnvelopeSchema = z.object({
  id: z.string(),
  eventType: z.enum(["payment.payment.status_updated"]),
  occurredAt: z.iso.datetime(),
  correlationId: z.string(),
  idempotencyKey: z.string(),
  producer: z.string(),
  schemaVersion: z.string(),
  payload: paymentStatusUpdatedDataSchema,
});

export type KafkaEventEnvelope = z.infer<typeof kafkaEventEnvelopeSchema>;


export type PaymentStatusUpdatedData = z.infer<typeof paymentStatusUpdatedDataSchema>;

