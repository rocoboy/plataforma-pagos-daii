// 1. Borramos NextRequest
import { Payment, PaymentStatus, Currency } from "../../../../../../types/payments";
// 2. Importamos el cliente ADMIN
import { createAdminClient } from "@/lib/supabase/server";
import { ID } from "../../../../../../types/common";

export async function updatePaymentByReservationId(
  // 3. 'request' ELIMINADO de los parámetros
  res_id: string,
  status: PaymentStatus
): Promise<Payment | null> { 
  const supabase = createAdminClient();

  const { error: updateError } = await supabase
    .from("payments")
    .update({ status })
    .eq("res_id", res_id);

  if (updateError) {
    console.error("Error during payment update:", updateError.message);
    throw new Error(updateError.message);
  }

  const { data, error: selectError } = await supabase
    .from("payments")
    .select("*")
    .eq("res_id", res_id)
    .maybeSingle(); 

  if (selectError) {
    console.error("Error selecting payment after update:", selectError.message);
    throw new Error(selectError.message);
  }

  if (!data) {
    console.warn(`Received update for non-existent payment with res_id: ${res_id}. Ignoring.`);
    return null; 
  }
  
  return {
    id: data.id as ID,
    res_id: data.res_id as ID,
    user_id: data.user_id as ID,
    payment_intent_id: (data as any).payment_intent_id ? (data as any).payment_intent_id as ID : undefined,
    provider: "Talo", 
    status: data.status as PaymentStatus,
    amount: data.amount,
    currency: data.currency as Currency,
    meta: data.meta,
    created_at: new Date(data.created_at)
  };
}