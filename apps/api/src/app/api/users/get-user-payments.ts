import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import z from "zod";

export const getUserPaymentsBodySchema = z.object({
  user_id: z.string(),
});

export async function getUserPayments(request: NextRequest, user_id: string) {
  const supabase = createClient(request);

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", user_id);

  if (error) throw new Error(error.message);
  return data;
}
