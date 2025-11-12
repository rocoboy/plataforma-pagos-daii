import type { AmountCents, ID, ISODateTime, WithTimestamps } from "./common";
import type { Provider } from "./providers";

export type RefundStatus = "REQUESTED" | "PROCESSED" | "FAILED";

export type Refund = WithTimestamps & {
  id: ID;
  payment_id: ID;
  booking_id: ID;
  amount: AmountCents;
  status: RefundStatus;
  reason?: string;
  provider?: Provider; 
};
