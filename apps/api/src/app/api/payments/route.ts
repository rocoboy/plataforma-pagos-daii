import { NextRequest } from "next/server";
import { getAllPayments } from "./get-all-payments";
import { createCorsResponse, createCorsOptionsResponse } from "@/lib/cors";
import { adminAuthMiddleware } from "../middleware/adminAuth";

export async function GET(request: NextRequest) {
  // Check admin authorization
  const authError = adminAuthMiddleware(request);
  if (authError) {
    return authError;
  }

  try {
    const payments = await getAllPayments();
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
