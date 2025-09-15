import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function getAllPayments(request: NextRequest) {
  const supabase = createClient(request);

  const { data, error } = await supabase.from("payments").select("*");

  if (error) throw new Error(error.message);
  return data;
}
