import { NextRequest, NextResponse } from "next/server";
import { getPayment, getPaymentSchema } from "./get-payment";

//GET para obtener payments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsed = getPaymentSchema.safeParse({ id });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          issues: parsed.error.message,
        },
        { status: 400 }
      );
    }

    const { id: parsedId } = parsed.data;
    const payment = await getPayment(request, parsedId);

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
