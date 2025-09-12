import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import z from "zod";

export const getPaymentSchema = z.object({
  id: z.string(),
});

export async function getPayment(request: NextRequest, id: string) {
  const supabase = createClient(request);

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
