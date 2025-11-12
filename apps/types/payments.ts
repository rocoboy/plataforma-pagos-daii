import type { ID, ISODateTime } from "./common";
import type { PaymentProvider } from "./providers";
import * as z from "zod";
import { Constants } from "./schema-constants";

// Define el SCHEMA DE ZOD (esto lo usa el route.ts)
export const PaymentStatusEnum = z.enum(Constants.public.Enums.payment_status);

// Define los TIPOS de TypeScript
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;
export type Currency = (typeof Constants.public.Enums.currency)[number];


export type Payment = {
  user_id?: ID;
  id: ID;
  payment_intent_id?: ID;
  res_id: ID;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  meta?: unknown;
  created_at: Date | ISODateTime;
};

export type PaymentItem = {
  id: ID;
  booking_id: ID;
  status: PaymentStatus;
};