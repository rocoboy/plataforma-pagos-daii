import { NextRequest } from "next/server";
// Importa todos los tipos necesarios
import { Payment, PaymentStatus, Currency } from "../../../../../../types/payments";
import { createClient } from "@/lib/supabase/server";
import { ID } from "../../../../../../types/common";

export async function updatePaymentByReservationId(
  request: NextRequest,
  res_id: string,
  status: PaymentStatus
): Promise<Payment | null> { // <-- AHORA PUEDE DEVOLVER NULL
  const supabase = createClient(request);

  // --- INICIO DE LA CORRECCIÓN ---

  // 1. Primero, ACTUALIZA la fila. No usamos .select() ni .single() aquí.
  const { error: updateError } = await supabase
    .from("payments")
    .update({ status })
    .eq("res_id", res_id); // <-- Busca por res_id

  if (updateError) {
    console.error("Error during payment update:", updateError.message);
    throw new Error(updateError.message);
  }

  // 2. SELECCIONA. Usa .maybeSingle() para manejar 0 filas.
  const { data, error: selectError } = await supabase
    .from("payments")
    .select("*")
    .eq("res_id", res_id)
    .maybeSingle(); // <-- ¡CAMBIO CLAVE!

  if (selectError) {
    // Esto ahora solo fallará por un error real, no por 0 filas
    console.error("Error selecting payment after update:", selectError.message);
    throw new Error(selectError.message);
  }

  if (!data) {
    // 3. ¡No se encontró el pago!
    // Lo logueamos y devolvemos null
    console.warn(`Received update for non-existent payment with res_id: ${res_id}. Ignoring.`);
    return null; 
  }
  
  // --- FIN DE LA CORRECCIÓN ---
  
  // 4. Se encontró el pago, lo devolvemos
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