import { AmountCents, Currency, ID, ISODateTime, URLString, WithTimestamps } from "./common";

export type InvoiceStatus = "ISSUED";
export type CreditNoteStatus = "ISSUED";

export type Invoice = WithTimestamps & {
  id: ID;
  booking_id: ID;
  payment_id: ID;
  total: AmountCents;
  currency: Currency;
  status: InvoiceStatus;
  pdf_url?: URLString;
};

export type CreditNote = WithTimestamps & {
  id: ID;
  refund_id: ID;
  booking_id: ID;
  total: AmountCents;
  currency: Currency;
  status: CreditNoteStatus;
  pdf_url?: URLString;
};
