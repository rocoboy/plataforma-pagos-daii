import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function getAllPayments(_request: NextRequest) {
  // Use service role key for admin read of payments to bypass RLS when appropriate
  const supabase = createAdminClient();

  const { data, error } = await supabase.from("payments").select("*");

  if (error) throw new Error(error.message);
  return data;
}
