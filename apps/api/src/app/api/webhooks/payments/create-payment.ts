import { createAdminClient } from "@/lib/supabase/server";
// Borramos NextRequest
import z from "zod";
import { 
  Payment, 
  PaymentStatus, 
  Currency 
} from "../../../../../../types/payments"; 
import { ID } from "../../../../../../types/common";
import { createPaymentBodySchema } from "@plataforma/types";

// 1. CAMBIAMOS EL TIPO DE RETORNO
export async function createPayment(
  // 2. 'request' ELIMINADO de los parámetros
  res_id: string,
  amount: number,
  currency?: Currency,
  user_id?: string,
  meta?: unknown
): Promise<{ payment: Payment, isNew: boolean }> { // <-- TIPO DE RETORNO CAMBIADO
  
  const supabase = createAdminClient(); 

  // --- Lógica de Idempotencia ---
  const { data: existingPayment, error: findError } = await supabase
    .from("payments")
    .select("*")
    .eq("res_id", res_id)
    .maybeSingle(); 

  if (findError) {
    console.error("Error finding existing payment:", findError.message);
    throw new Error(findError.message);
  }

  if (existingPayment) {
    console.warn(`Duplicate payment creation attempt for res_id: ${res_id}. Returning existing payment.`);
    
    // 3. Devolvemos el pago Y EL FLAG 'isNew: false'
    return {
      payment: {
        user_id: existingPayment.user_id as ID,
        id: existingPayment.id as ID,
        res_id: existingPayment.res_id as ID,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payment_intent_id: (existingPayment as any).payment_intent_id ? (existingPayment as any).payment_intent_id as ID : undefined,
        provider: 'Talo', 
        status: existingPayment.status as PaymentStatus,
        amount: existingPayment.amount,
        currency: existingPayment.currency as Currency,
        meta: (existingPayment.meta ?? meta) as unknown,
        created_at: new Date(existingPayment.created_at),
      },
      isNew: false // <-- AVISAMOS QUE ES UN DUPLICADO
    };
  }

  // --- Creación de Pago ---
  const defaultPaymentStatus: PaymentStatus = "PENDING";
  const payload: z.infer<typeof createPaymentBodySchema> & {
    status: PaymentStatus;
  } = { res_id, status: defaultPaymentStatus, amount };
  
  if (currency) payload.currency = currency;
  if (user_id) payload.user_id = user_id;
  if (typeof meta !== "undefined") payload.meta = meta;
  
  const { data, error } = await supabase
    .from("payments")
    .insert(payload)
    .select("*")
    .single();
  
  if (error) {
    console.error("Error inserting new payment:", error.message);
    throw new Error(error.message); 
  }

  // 4. Devolvemos el pago Y EL FLAG 'isNew: true'
  return {
    payment: {
      user_id: data.user_id as ID,
      id: data.id as ID,
      res_id: data.res_id as ID,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      payment_intent_id: (data as any).payment_intent_id ? (data as any).payment_intent_id as ID : undefined,
      provider: 'Talo',
      status: data.status as PaymentStatus,
      amount: data.amount,
      currency: data.currency as Currency,
      meta: (data.meta ?? meta) as unknown,
      created_at: new Date(data.created_at),
    },
    isNew: true // <-- AVISAMOS QUE ES NUEVO
  };
}

export { createPaymentBodySchema };