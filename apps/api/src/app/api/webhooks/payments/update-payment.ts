import { NextRequest } from "next/server";
import { PaymentStatus } from "./create-payment";
import { createClient } from "@/lib/supabase/server";

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

