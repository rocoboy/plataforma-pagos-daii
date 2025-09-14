import { NextRequest, NextResponse } from "next/server";
import { createPayment, createPaymentBodySchema } from "./create-payment";
import { updatePayment, updatePaymentBodySchema } from "./update-payment";
import { cancelPayment } from "./cancel-payment";
import { refundPayment } from "./refund-payment";
import z from "zod";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

//POST para crear payments
export async function POST(request: NextRequest) {
  try {
    //validar body
    const json = await request.json();
    const parsed = createPaymentBodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          issues: parsed.error.message,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const { 
      user_id, 
      meta, 
      amount, 
      currency,
      externalUserId,
      reservationId
    } = parsed.data;
    const payment = await createPayment(
      request,
      amount,
      reservationId, // Moved to match new parameter order
      currency,
      user_id,
      meta,
      externalUserId
    );

    // Extract Reservas fields from payment metadata
    const metaData = payment.meta && typeof payment.meta === 'object' ? payment.meta as Record<string, any> : {};
    const reservasData = metaData.reservas || {};
    
    // Return response in format expected by Reservas module
    return NextResponse.json(
      {
        paymentStatus: reservasData.Payment_status || payment.status,
        reservationId: reservasData.reservationId || reservationId,
        externalUserId: reservasData.externalUserId || externalUserId,
        paymentEventId: reservasData.PaymentEventId || payment.id
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

//PUT para actualizar payments
export async function PUT(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = updatePaymentBodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          issues: parsed.error.message,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const { id, status } = parsed.data;
    const payment = await updatePayment(request, id, status);

    // Extract Reservas fields from payment metadata
    const metaData = payment.meta && typeof payment.meta === 'object' ? payment.meta as Record<string, any> : {};
    const reservasData = metaData.reservas || {};

    // Return response in format expected by Reservas module
    return NextResponse.json(
      {
        paymentStatus: reservasData.Payment_status || payment.status,
        reservationId: reservasData.reservationId,
        externalUserId: reservasData.externalUserId,
        paymentEventId: reservasData.PaymentEventId || payment.id
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Schema for action requests
const actionBodySchema = z.object({
  id: z.string(),
  action: z.enum(['cancel', 'refund']),
  reason: z.string().optional(),
  amount: z.number().optional(), // For partial refunds
});

//PATCH para acciones específicas (cancelar, reembolsar)
export async function PATCH(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = actionBodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          issues: parsed.error.message,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const { id, action, reason, amount } = parsed.data;
    let payment;

    switch (action) {
      case 'cancel':
        payment = await cancelPayment(request, id, reason);
        break;
      case 'refund':
        payment = await refundPayment(request, id, amount, reason);
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
          },
          { status: 400, headers: corsHeaders }
        );
    }

    // Extract Reservas fields from payment metadata
    const metaData = payment.meta && typeof payment.meta === 'object' ? payment.meta as Record<string, any> : {};
    const reservasData = metaData.reservas || {};

    // Return response in format expected by Reservas module
    return NextResponse.json(
      {
        paymentStatus: reservasData.Payment_status || payment.status,
        reservationId: reservasData.reservationId,
        externalUserId: reservasData.externalUserId,
        paymentEventId: reservasData.PaymentEventId || payment.id
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
