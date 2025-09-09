export const PAYMENT_PROVIDERS = ["Talo", "Interbanking", "Mercado Pago"] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export type Provider<T extends PaymentProvider = PaymentProvider> = {
  provider: T;
  provider_id: string;       
};
