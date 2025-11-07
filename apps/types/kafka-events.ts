import { z } from "zod";
import { PaymentStatusEnum } from "./payments";


export const createPaymentBodySchema = z.object({
  res_id: z.string(),
  user_id: z.string().optional(),
  amount: z.number(),
  currency: z.enum(["ARS", "USD", "EUR"]).optional(),
  meta: z.any().optional(),
});


export const updatePaymentBodySchema = z.object({
  id: z.string(),
  status: PaymentStatusEnum,
});


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

// Create Reservation Event payload schema
export const createReservationEventDataSchema = z.object({
  reservationId: z.string(),
  userId: z.string(),
  status: z.string(),
  createdAt: z.iso.datetime(),
}).strict(); // additionalProperties: false

// Update Reservation Event payload schema
export const updateReservationEventDataSchema = z.object({
  reservationId: z.string(),
  newStatus: z.string(),
  reservationDate: z.iso.datetime().optional(),
  flightDate: z.iso.datetime().optional(),
}).strict(); // additionalProperties: false
  
export const RELEVANT_EVENTS = [   "payments.payment.status_updated", 
  "reservations.reservation.created",
  "reservations.reservation.updated"
] as const;

export type RelevantEvents = typeof RELEVANT_EVENTS[number];

// Base schema for Kafka event envelopes
export const kafkaEventEnvelopeSchema = z.object({
  messageId: z.string(),
  eventType: z.enum([
    ...RELEVANT_EVENTS
  ]),
  occurredAt: z.iso.datetime(),
  correlationId: z.string(),
  idempotencyKey: z.string(),
  producer: z.string(),
  schemaVersion: z.string(),
  payload: z.string().describe("The raw JSON payload of the event"),
});

export type KafkaEventEnvelope = z.infer<typeof kafkaEventEnvelopeSchema>;


export type PaymentStatusUpdatedData = z.infer<typeof paymentStatusUpdatedDataSchema>;

export type CreateReservationEventData = z.infer<typeof createReservationEventDataSchema>;

export type UpdateReservationEventData = z.infer<typeof updateReservationEventDataSchema>;

export interface CreateReservationEvent extends KafkaEventEnvelope {
  eventType: "reservations.reservation.created";
  payload: string; // JSON string containing CreateReservationEventData
}

export interface UpdateReservationEvent extends KafkaEventEnvelope {
  eventType: "reservations.reservation.updated";
  payload: string; // JSON string containing UpdateReservationEventData
}

