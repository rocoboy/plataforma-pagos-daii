import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { Constants } from "@/lib/supabase/schema";
import z from "zod";
import { Payment } from "../../../../../../types/payments";
import { ID, ISODateTime } from "../../../../../../types/common";

export const createPaymentBodySchema = z.object({
  res_id: z.string(),
  user_id: z.string().optional(),
  amount: z.number(),
  currency: z.enum(Constants.public.Enums.currency).optional(),
  meta: z.any().optional(),
});

export type PaymentStatus =
  (typeof Constants.public.Enums.payment_status)[number];

export type Currency = (typeof Constants.public.Enums.currency)[number];

export async function createPayment(
  request: NextRequest,
  res_id: string,
  amount: number,
  currency?: Currency,
  user_id?: string,
  meta?: unknown
): Promise<Payment> {
  const supabase = createClient(request);

  const defaultPaymentStatus: PaymentStatus = "PENDING";
  
  const payload: z.infer<typeof createPaymentBodySchema> & {
    status: PaymentStatus;
  } = { res_id, status: defaultPaymentStatus, amount };
  
  if (!currency) payload.currency = "ARS";
  
  if (user_id) payload.user_id = user_id;
  
  if (typeof meta !== "undefined") payload.meta = meta;
  
  const { data, error } = await supabase
  .from("payments")
  .insert(payload)
  .select("*")
  .single();
  
  if (error) throw new Error(error.message);
  return {
    id: data.id as ID,
    res_id: res_id as ID,
    provider: 'Talo',
    status: defaultPaymentStatus,
    amount: amount,
    currency: currency ?? 'ARS',
    created_at: new Date(),
  };
}
