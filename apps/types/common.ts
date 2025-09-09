export type ID = string & { readonly __brand: "ID" };
export type ISODateTime = string & { readonly __brand: "ISODateTime" };
export type URLString = string & { readonly __brand: "URL" };

export type Currency = "ARS" | "USD" | "EUR";
export type AmountCents = number & { readonly __brand: "AmountCents" };

export type WithTimestamps = { created_at: ISODateTime; updated_at?: ISODateTime };

export type Pagination = { page?: number; pageSize?: number };

export type Result<Ok, Err = { code: string; message: string }> =
  | { ok: true; value: Ok }
  | { ok: false; error: Err };
