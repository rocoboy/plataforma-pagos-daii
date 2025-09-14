import { NextRequest, NextResponse } from "next/server";
import { processPayment, processPaymentBodySchema } from "./process-payment";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params;
    
    // Validate request body
    const json = await request.json();
    const parsed = processPaymentBodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          issues: parsed.error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          })),
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Process payment
    const result = await processPayment(request, paymentId, parsed.data);

    return NextResponse.json(
      { 
        success: true, 
        payment: result.payment,
        transaction_id: result.gatewayResponse.transactionId,
        status: result.success ? 'approved' : 'rejected'
      },
      { 
        status: result.success ? 200 : 402, // 402 Payment Required for rejected payments
        headers: corsHeaders 
      }
    );
  } catch (error) {
    console.error('Payment processing error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Payment processing failed",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}