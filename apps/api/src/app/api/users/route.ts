import { NextRequest, NextResponse } from "next/server";
import {
  getUserPayments,
  getUserPaymentsBodySchema,
} from "./get-user-payments";

export async function GET(request: NextRequest) {
  const json = await request.json();
  const parsed = getUserPaymentsBodySchema.safeParse(json);
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

  const { user_id } = parsed.data;
  const payments = await getUserPayments(request, user_id);

  return NextResponse.json({ success: true, payments });
}
