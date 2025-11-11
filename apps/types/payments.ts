import type { ID } from "./common";
import type { PaymentProvider } from "./providers";
import * as z from "zod";

export const PAYMENT_STATUS = ["PENDING", "SUCCESS", "FAILURE", "EXPIRED", "REFUND"] as const;

// Payment status enum matching the schema
export const PaymentStatusEnum = z.enum(PAYMENT_STATUS);

export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

export type Payment = {
  user_id?: ID;
  id: ID;
  payment_intent_id?: ID;
  res_id: ID;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: "ARS" | "USD" | "EUR";
  meta?: unknown;
  created_at: Date;
};

export type PaymentItem = {
  id: ID;
  booking_id: ID;
  status: PaymentStatus;
};