import { NextRequest } from "next/server";
import { updatePayment } from "./update-payment";

export async function refundPayment(
  request: NextRequest,
  paymentId: string,
  refundAmount?: number,
  reason?: string
) {
  try {
    // Update payment status to REFUND
    const payment = await updatePayment(request, paymentId, "REFUND");
    
    console.log(`Payment ${paymentId} refunded. Amount: ${refundAmount || 'Full refund'}, Reason: ${reason || 'No reason provided'}`);
    
    return payment;
  } catch (error) {
    console.error(`Failed to refund payment ${paymentId}:`, error);
    throw error;
  }
}