import type { ID, ISODateTime, Currency } from "./common";
// Re-export Currency so other modules can import it from `types/payments`
export type { Currency } from "./common";
import type { PaymentProvider } from "./providers";
import * as z from "zod";


// (Desde 'apps/types/' subimos a 'apps/', entramos a 'api/src/lib...')
import { Constants } from "../api/src/lib/supabase/schema";
// 2. Define el SCHEMA DE ZOD (esto lo usa el route.ts)
export const PaymentStatusEnum = z.enum(Constants.public.Enums.payment_status);

// 3. Define los TIPOS de TypeScript
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

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