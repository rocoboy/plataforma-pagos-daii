import { NextRequest } from "next/server";
import { createPayment, createPaymentBodySchema } from "./create-payment";
import { updatePayment, updatePaymentBodySchema } from "./update-payment";
import { createCorsResponse, createCorsOptionsResponse } from "@/lib/cors";

//POST para crear payments
export async function POST(request: NextRequest) {
  try {
    //validar body
    const json = await request.json();
    const parsed = createPaymentBodySchema.safeParse(json);

    if (!parsed.success) {
      return createCorsResponse(request, {
        success: false,
        error: "Invalid request body",
        issues: parsed.error.message,
      }, 400);
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

    return createCorsResponse(request, { success: true, payment });
  } catch (error) {
    return createCorsResponse(request, {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
}

//PUT para actualizar payments
export async function PUT(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = updatePaymentBodySchema.safeParse(json);

    if (!parsed.success) {
      return createCorsResponse(request, {
        success: false,
        error: "Invalid request body",
        issues: parsed.error.message,
      }, 400);
    }

    const { id, status } = parsed.data;
    const payment = await updatePayment(request, id, status);

    return createCorsResponse(request, { success: true, payment });
  } catch (error) {
    return createCorsResponse(request, {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
}

// Handle preflight OPTIONS request
export async function OPTIONS(request: NextRequest) {
  return createCorsOptionsResponse(request);
}
