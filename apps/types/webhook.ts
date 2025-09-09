import { ID, ISODateTime } from "./common";
import { PaymentProvider } from "./providers";

export type HMACHeader = {
  "x-signature-alg": "HMAC-SHA256";
  "x-signature": string;
  "x-timestamp": ISODateTime;
  "x-provider": PaymentProvider;
};

export type PSPWebhookPayload =
  | { type: "payment.approved"; payment_id: ID; provider_id: string; provider: PaymentProvider }
  | { type: "payment.declined"; payment_id: ID; provider_id: string; provider: PaymentProvider; reason?: string }
  | { type: "refund.processed"; refund_id: ID; provider_id: string; provider: PaymentProvider }
  | { type: "refund.failed"; refund_id: ID; provider_id: string; provider: PaymentProvider; reason?: string };

export type WebhookAck = { received: true };
