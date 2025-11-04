
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCorsResponse } from "@/lib/cors"; 
const webhookApiPayloadSchema = z.object({
  messageId: z.string(),
  eventType: z.string(),
  schemaVersion: z.string(),
  occurredAt: z.string().datetime(),
  producer: z.string(),
  correlationId: z.string().optional(),
  idempotencyKey: z.string().optional(),
  payload: z.string(), 
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = webhookApiPayloadSchema.safeParse(json);

    if (!parsed.success) {
      return createCorsResponse(
        request,
        {
          success: false,
          error: "Invalid webhook body",
          issues: parsed.error.message,
        },
        400
      );
    }

    const event = parsed.data;

   
    console.log(`✅ Webhook recibido exitosamente: ${event.eventType}`);

    const innerPayload = JSON.parse(event.payload);
    console.log("Payload interno:", innerPayload);

    
    return createCorsResponse(request, { success: true, received: true });
    
  } catch (error) {
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