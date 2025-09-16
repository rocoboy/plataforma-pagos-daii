import { NextRequest } from "next/server";
import { getPayment, getPaymentSchema } from "./get-payment";
import { createCorsResponse, createCorsOptionsResponse } from "@/lib/cors";

//GET para obtener payments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsed = getPaymentSchema.safeParse({ id });

    if (!parsed.success) {
      return createCorsResponse(request, {
        success: false,
        error: "Invalid request body",
        issues: parsed.error.message,
      }, 400);
    }

    const { id: parsedId } = parsed.data;
    const payment = await getPayment(request, parsedId);

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
