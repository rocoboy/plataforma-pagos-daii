import { NextRequest, NextResponse } from "next/server";
import { getPayment, getPaymentSchema } from "./get-payment";
import { createClient } from "@/lib/supabase/server";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

//GET para obtener payments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Fetching payment with ID:', id); // Debug log
    
    const parsed = getPaymentSchema.safeParse({ id });

    if (!parsed.success) {
      console.log('Schema validation failed:', parsed.error); // Debug log
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          issues: parsed.error.message,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const { id: parsedId } = parsed.data;
    console.log('Parsed ID:', parsedId); // Debug log
    
    const payment = await getPayment(request, parsedId);
    console.log('Payment found:', payment); // Debug log

    return NextResponse.json(
      { success: true, payment },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error fetching payment:', error); // Debug log
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE to remove a payment (for testing cleanup)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Deleting payment with ID:', id); // Debug log
    
    const parsed = getPaymentSchema.safeParse({ id });

    if (!parsed.success) {
      console.log('Schema validation failed:', parsed.error); // Debug log
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment ID",
          issues: parsed.error.message,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(request);
    const { id: parsedId } = parsed.data;
    
    // Delete the payment from database
    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", parsedId);

    if (error) {
      console.error('Database delete error:', error); // Debug log
      throw new Error(error.message);
    }

    console.log('Payment deleted successfully:', parsedId); // Debug log

    return NextResponse.json(
      { 
        success: true, 
        message: `Payment ${parsedId} deleted successfully` 
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error deleting payment:', error); // Debug log
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
