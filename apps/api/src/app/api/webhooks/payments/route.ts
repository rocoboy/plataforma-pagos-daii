import { NextRequest } from "next/server";
import { createPayment, createPaymentBodySchema } from "./create-payment";
import { updatePaymentByReservationId } from "./update-payment";
import { z } from "zod";
import { createCorsResponse, createCorsOptionsResponse } from "@/lib/cors";
import { publishPaymentStatusUpdated } from "@/lib/core";
import { PaymentStatus, Currency, PaymentStatusEnum } from "../../../../../../types/payments";
import { ISODateTime } from "../../../../../../types/common";

// Helper para simular tiempo de espera (2 segundos)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const updatePaymentSchema = z.object({
  res_id: z.string().min(1),
  status: PaymentStatusEnum,
});

// ===================================
// FUNCIÓN POST (Ciclo Completo Automático)
// ===================================
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = createPaymentBodySchema.safeParse(json);
    
    if (!parsed.success) {
      console.error("❌ Zod validation failed (400):", parsed.error.message);
      return createCorsResponse(request, { success: false, error: "Invalid body", issues: parsed.error.message }, 400);
    }
    
    const { res_id, user_id, meta, amount, currency } = parsed.data;
    
    // 1. CREAR EL PAGO (Estado Inicial: PENDING)
    const { payment, isNew } = await createPayment(
      res_id,
      amount,
      currency,
      user_id,
      meta
    );
    
    // 2. SI ES NUEVO, EJECUTAR EL CICLO AUTOMÁTICO
    if (isNew) {
      try {
        // A) Publicar el primer evento (PENDING)
        console.log(`📢 [1/3] Payment Created. Publishing PENDING for ${res_id}...`);
        await publishPaymentStatusUpdated({
          paymentId: payment.id,
          reservationId: payment.res_id,
          userId: user_id,
          status: payment.status as PaymentStatus,
          amount: payment.amount,
          currency: payment.currency as Currency,
          updatedAt: new Date().toISOString() as ISODateTime,
        });

        // B) Simular tiempo de procesamiento (La API "piensa" por 2 segundos)
        console.log("⏳ [2/3] Processing payment (waiting 2s)...");
        await delay(2000); 

        // C) Decidir resultado (75% Éxito, 25% Fallo)
        const isFailure = Math.random() < 0.25; 
        const finalStatus: PaymentStatus = isFailure ? 'FAILURE' : 'SUCCESS';
        
        console.log(`🎲 Result for ${res_id}: ${finalStatus}`);

        // D) Actualizar la base de datos automáticamente
        const updatedPayment = await updatePaymentByReservationId(
          res_id, 
          finalStatus
        );

        // E) Publicar el evento final (SUCCESS/FAILURE)
        if (updatedPayment) {
          console.log(`📢 [3/3] Publishing FINAL event (${finalStatus}) for ${res_id}`);
          await publishPaymentStatusUpdated({
            paymentId: updatedPayment.id,
            reservationId: updatedPayment.res_id,
            userId: updatedPayment.user_id,
            status: updatedPayment.status,
            amount: updatedPayment.amount,
            currency: updatedPayment.currency,
            updatedAt: new Date().toISOString() as ISODateTime,
          });
        }

      } catch (error) {
        console.error(`❌ Error during automatic processing:`, error);
        // Si falla la simulación, al menos el pago quedó creado en PENDING.
        // Podrías devolver 500 si prefieres que el Bridge reintente.
      }
    } else {
        console.log(`ℹ️ Payment for ${res_id} already exists. Skipping automation.`);
    }

    // 3. RESPONDER AL BRIDGE
    // El Bridge recibirá el 200 OK recién cuando termine todo el proceso (aprox 2-3 segundos)
    return createCorsResponse(request, { success: true, payment: payment });

  } catch (error) {
    console.error("❌ Error in POST /api/webhooks/payments:", error);
    return createCorsResponse(request, { success: false, error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
}


// ===================================
// FUNCIÓN PUT (Para actualizaciones manuales si hicieran falta)
// ===================================
export async function PUT(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = updatePaymentSchema.safeParse(json);

    if (!parsed.success) {
      console.error("❌ Zod validation failed (400):", parsed.error.message);
      return createCorsResponse(request, { success: false, error: "Invalid body", issues: parsed.error.message }, 400);
    }

    const { res_id, status } = parsed.data;
    
    const payment = await updatePaymentByReservationId(
      res_id, 
      status as PaymentStatus
    );

    if (!payment) {
      return createCorsResponse(request, { success: true, payment: null, message: "Payment not found, ignored." });
    }

    try {
      await publishPaymentStatusUpdated({
        paymentId: payment.id,
        reservationId: payment.res_id,
        userId: payment.user_id,
        status: payment.status as PaymentStatus,
        amount: payment.amount,
        currency: payment.currency as Currency,
        updatedAt: new Date().toISOString() as ISODateTime,
      });
    } catch (error) {
      console.error(`❌ Failed to publish payment status updated event:`, error);
      throw error;
    }

    return createCorsResponse(request, { success: true, payment });
  } catch (error) {
    console.error("❌ Error in PUT /api/webhooks/payments:", error);
    return createCorsResponse(request, { success: false, error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
}

// Handle preflight OPTIONS request
export async function OPTIONS(request: NextRequest) {
  return createCorsOptionsResponse(request);
}