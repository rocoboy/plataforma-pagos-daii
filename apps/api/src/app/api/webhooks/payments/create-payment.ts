import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { Constants, Database } from "@/lib/supabase/schema";
import z from "zod";
import { Payment } from "../../../../../../types/payments";
import { ID } from "../../../../../../types/common";
import { createPaymentBodySchema } from "@plataforma/types";

type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];

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
  
  if (!data) throw new Error("No data returned from insert");
  
  const paymentData = data as PaymentRow;
  
  return {
    user_id: (paymentData.user_id ?? undefined) as ID | undefined,
    id: paymentData.id as ID,
    res_id: res_id as ID,
    provider: 'Talo',
    status: defaultPaymentStatus,
    amount: amount,
    currency: currency ?? 'ARS',
    meta: (paymentData.meta ?? meta) as unknown,
    created_at: new Date(),
  };
}

export { createPaymentBodySchema };
