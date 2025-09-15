import { NextRequest, NextResponse } from "next/server";
import { getAllPayments } from "./get-all-payments";

export async function GET(request: NextRequest) {
  try {
    const payments = await getAllPayments(request);
    return NextResponse.json({ success: true, payments });
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
