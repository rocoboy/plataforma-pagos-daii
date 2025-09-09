import { ID, ISODateTime } from "./common";
import { Booking } from "./booking";
import { Payment, PaymentItem } from "./payments";

export type Envelope<TName extends EventName, TData> = {
  id: ID;
  name: TName;
  occurred_at: ISODateTime;
  correlation_id?: ID;
  source: "core" | "payments-svc" | "psp-emulator" | "billing-svc";
  data: TData;
};

export type EventName =
  | "booking.created"
  | "payment.intent.created"
  | "payment.created"
  | "payment.updated";

export type EBookingCreated = Envelope<"booking.created", {
  booking: Pick<Booking, "id" | "status">;
}>;

export type EPaymentIntentCreated = Envelope<"payment.intent.created", {
  intent: Pick<PaymentItem, "id" | "booking_id" | "status">;
}>;

export type EPaymentCreated = Envelope<"payment.created", {
  payment: Pick<Payment,
    | "id"
    | "payment_intent_id"
    | "booking_id"
    | "provider"
    | "status"
    | "amount"
    | "currency"
  >;
}>;

export type EPaymentUpdated = Envelope<"payment.updated", {
  payment: Pick<Payment,
    | "id"
    | "payment_intent_id"
    | "booking_id"
    | "provider"
    | "status"
    | "amount"
    | "currency"
  >;
  reason?: string; 
}>;

export type DomainEvent =
  | EBookingCreated
  | EPaymentIntentCreated
  | EPaymentCreated
  | EPaymentUpdated;