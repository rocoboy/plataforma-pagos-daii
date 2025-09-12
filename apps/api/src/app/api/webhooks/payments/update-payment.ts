import { NextRequest } from "next/server";
import { PaymentStatus } from "./create-payment";
import { createClient } from "@/lib/supabase/server";
import { Constants } from "@/lib/supabase/schema";
import z from "zod";

export const updatePaymentBodySchema = z.object({
  id: z.string(),
  status: z.enum(Constants.public.Enums.payment_status),
});

export async function updatePayment(
  request: NextRequest,
  id: string,
  status: PaymentStatus
) {
  const supabase = createClient(request);

  const { data, error } = await supabase
    .from("payments")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
