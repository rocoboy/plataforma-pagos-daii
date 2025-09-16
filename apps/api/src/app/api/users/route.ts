import { NextRequest } from "next/server";
import {
  getUserPayments,
  getUserPaymentsBodySchema,
} from "./get-user-payments";
import { createCorsResponse, createCorsOptionsResponse } from "@/lib/cors";

export async function GET(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = getUserPaymentsBodySchema.safeParse(json);
    if (!parsed.success) {
      return createCorsResponse(request, {
        success: false,
        error: "Invalid request body",
        issues: parsed.error.message,
      }, 400);
    }

    const { user_id } = parsed.data;
    const payments = await getUserPayments(request, user_id);

    return createCorsResponse(request, { success: true, payments });
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
