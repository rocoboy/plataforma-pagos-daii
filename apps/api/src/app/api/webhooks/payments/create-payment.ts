import { createAdminClient } from "@/lib/supabase/server";
import z from "zod";
import { 
  Payment, 
  PaymentStatus, 
  Currency 
} from "../../../../../../types/payments"; 
import { ID } from "../../../../../../types/common";
import { createPaymentBodySchema } from "@plataforma/types";

export async function createPayment(
  res_id: string,
  amount: number,
  currency?: Currency,
  user_id?: string,
  meta?: unknown
): Promise<{ payment: Payment, isNew: boolean }> {
  
  const supabase = createAdminClient(); 

  // 1. INTENTO DE LECTURA INICIAL (Optimización)
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
    return { 
        payment: mapPayment(existingPayment), 
        isNew: false // Ya existía
    };
  }

  // 2. PREPARAR DATOS
  const defaultPaymentStatus: PaymentStatus = "PENDING";
  
  const payload: z.infer<typeof createPaymentBodySchema> & {
    status: PaymentStatus;
  } = { res_id, status: defaultPaymentStatus, amount };
  
  if (currency) payload.currency = currency;
  if (user_id) payload.user_id = user_id;
  if (typeof meta !== "undefined") payload.meta = meta;
  
  // 3. INTENTO DE INSERCIÓN BLINDADO (Manejo de Race Condition)
  const { data, error } = await supabase
    .from("payments")
    .insert(payload)
    .select("*")
    .single();
  
  if (error) {
    // --- AQUÍ ESTÁ LA MAGIA QUE TE FALTA ---
    // Si falla por duplicado (código 23505), significa que otro hilo ganó la carrera.
    if (error.code === '23505' || error.message.includes('duplicate key')) {
      console.warn(`Race condition detected for res_id: ${res_id}. Recovering existing payment.`);
      
      // Buscamos el pago que el "otro" hilo acaba de crear
      const { data: racePayment, error: retryError } = await supabase
        .from("payments")
        .select("*")
        .eq("res_id", res_id)
        .single();
        
      if (racePayment) {
        // Devolvemos el pago existente y marcamos isNew: false
        // Esto evita que el error 500 interrumpa el proceso
        return { 
            payment: mapPayment(racePayment), 
            isNew: false 
        }; 
      }
      
      // Si no lo encontramos al reintentar, entonces sí es un error raro
      if (retryError) throw new Error(retryError.message);
    }
    // ---------------------------------------

    console.error("Error inserting new payment:", error.message);
    throw new Error(error.message); 
  }

  // 4. ÉXITO: Creado nuevo
  return {
    payment: mapPayment(data),
    isNew: true // Es nuevo, así que el route.ts ejecutará la simulación
  };
}

// Helper para mapear los datos de Supabase a nuestro tipo Payment
// (Evita repetir este bloque gigante de código 3 veces)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPayment(data: any): Payment {
  return {
    user_id: data.user_id as ID,
    id: data.id as ID,
    res_id: data.res_id as ID,
    payment_intent_id: data.payment_intent_id ? data.payment_intent_id as ID : undefined,
    provider: 'Talo', 
    status: data.status as PaymentStatus,
    amount: data.amount,
    currency: data.currency as Currency,
    meta: (data.meta ?? undefined) as unknown,
    created_at: new Date(data.created_at),
  };
}

export { createPaymentBodySchema };