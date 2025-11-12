import { NextRequest } from "next/server";
import { createPayment, createPaymentBodySchema } from "./create-payment";
// Importa la función de update correcta
import { updatePaymentByReservationId } from "./update-payment";
import { z } from "zod";
import { createCorsResponse, createCorsOptionsResponse } from "@/lib/cors";
import { publishPaymentStatusUpdated } from "@/lib/core";
// Importa los tipos correctos (incluyendo PaymentStatusEnum)
import { PaymentStatus, Currency, PaymentStatusEnum } from "../../../../../../types/payments";
import { ISODateTime } from "../../../../../../types/common";


// Define un schema local para el PUT que espera res_id
const updatePaymentSchema = z.object({
  res_id: z.string().min(1),
  status: PaymentStatusEnum, // Valida que el status sea uno de los conocidos
});

export async function POST(request: NextRequest) {
  try {
    //validar body
    const json = await request.json();
    const parsed = createPaymentBodySchema.safeParse(json);
    
    if (!parsed.success) {
      console.error("❌ Zod validation failed (400):", parsed.error.message);
      return createCorsResponse(
        request,
        {
          success: false,
          error: "Invalid request body",
          issues: parsed.error.message,
        },
        400
      );
    }
    
    const { res_id, user_id, meta, amount, currency } = parsed.data;
    const payment = await createPayment(
      request,
      res_id,
      amount,
      currency,
      user_id,
      meta
    );
    
    //publish event
    try {
      await publishPaymentStatusUpdated({
        paymentId: payment.id,
        reservationId: payment.res_id,
        userId: user_id,
        status: payment.status as PaymentStatus,
        amount: payment.amount,
        currency: payment.currency as Currency,
        updatedAt: new Date().toISOString() as ISODateTime,
      });
    } catch (error) {
      console.error(
        `❌ Failed to publish payment status updated event:`,
        error
      );
      throw error;
    }

    return createCorsResponse(request, { success: true, payment });
  } catch (error) {
    // Imprime el error en los logs de Vercel
    console.error("❌ Error in POST /api/webhooks/payments:", error);
    return createCorsResponse(
      request,
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
}


export async function PUT(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = updatePaymentSchema.safeParse(json);

    if (!parsed.success) {
      console.error("❌ Zod validation failed (400):", parsed.error.message);
      return createCorsResponse(
        request,
        {
          success: false,
          error: "Invalid request body",
          issues: parsed.error.message,
        },
        400
      );
    }

    const { res_id, status } = parsed.data;
    
    const payment = await updatePaymentByReservationId(
      request, 
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
      console.error(
        `❌ Failed to publish payment status updated event:`,
        error
      );
      throw error;
    }

    return createCorsResponse(request, { success: true, payment });
  } catch (error) {
    console.error("❌ Error in PUT /api/webhooks/payments:", error);
    return createCorsResponse(
      request,
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
}
// Handle preflight OPTIONS request
export async function OPTIONS(request: NextRequest) {
  return createCorsOptionsResponse(request);
}