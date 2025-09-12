import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { Constants } from "@/lib/supabase/schema";
import z from "zod";

export const createPaymentBodySchema = z.object({
  res_id: z.string(),
  user_id: z.string().optional(),
  meta: z.any().optional(),
});

export type PaymentStatus =
  (typeof Constants.public.Enums.payment_status)[number];

export async function createPayment(
  request: NextRequest,
  res_id: string,
  user_id?: string,
  meta?: unknown
) {
  const supabase = createClient(request);

  const defaultPaymentStatus: PaymentStatus = "PENDING";
  const payload: z.infer<typeof createPaymentBodySchema> & {
    status: PaymentStatus;
  } = { res_id, status: defaultPaymentStatus };
  if (user_id) payload.user_id = user_id;
  if (typeof meta !== "undefined") payload.meta = meta;

  const { data, error } = await supabase
    .from("payments")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
