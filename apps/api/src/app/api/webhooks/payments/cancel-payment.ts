import { NextRequest } from "next/server";
import { updatePayment } from "./update-payment";

export async function cancelPayment(
  request: NextRequest,
  paymentId: string,
  reason?: string
) {
  try {
    // Update payment status to FAILURE (cancelled)
    const payment = await updatePayment(request, paymentId, "FAILURE");
    
    console.log(`Payment ${paymentId} cancelled. Reason: ${reason || 'No reason provided'}`);
    
    return payment;
  } catch (error) {
    console.error(`Failed to cancel payment ${paymentId}:`, error);
    throw error;
  }
}