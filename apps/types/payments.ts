import { ID } from "./common";
import { PaymentProvider } from "./providers";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILURE" | "UNDERPAID" | "OVERPAID" | "EXPIRED" | "REFUND";

export type Payment = {
  id: ID;
  payment_intent_id?: ID;
  booking_id: ID;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: "ARS" | "USD" | "EUR";
  created_at: Date;
};

export type PaymentItem = {
  id: ID;
  booking_id: ID;
  status: PaymentStatus;
};