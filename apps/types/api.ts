import { ID, Result } from "./common";
import { Refund, RefundStatus } from "./refunds";
import { Invoice, CreditNote } from "./invoicing";
import { Payment, PaymentStatus } from "./payments";

// --- Pagos ---
export type CreatePaymentRequest = {
  booking_id: ID;
  amount_cents: number;
  currency: "ARS" | "USD" | "EUR";
  provider: string;
};
export type CreatePaymentResponse = Result<{ payment: Payment }>;

export type GetPaymentResponse = Result<{ payment: Payment }>;
export type ListPaymentsQuery = { booking_id?: ID; status?: PaymentStatus };
export type ListPaymentsResponse = Result<{ payments: Payment[] }>;

// --- Reembolsos ---
export type CreateRefundRequest = {
  payment_id: ID;
  amount_cents: number;
  reason?: string;
};
export type CreateRefundResponse = Result<{ refund: Refund }>;

export type GetRefundResponse = Result<{ refund: Refund }>;
export type ListRefundsQuery = { payment_id?: ID; booking_id?: ID; status?: RefundStatus };
export type ListRefundsResponse = Result<{ refunds: Refund[] }>;

// --- Facturación ---
export type GetInvoiceResponse = Result<{ invoice: Invoice }>;
export type GetCreditNoteResponse = Result<{ credit_note: CreditNote }>;