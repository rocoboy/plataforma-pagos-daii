import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";
import { PaymentGateway, PaymentRequest } from "@/lib/payment-gateway";
import { 
  getEventPublisher, 
  createPaymentCompletedEvent, 
  createPaymentFailedEvent 
} from "@/lib/event-publisher";
import z from "zod";

export const processPaymentBodySchema = z.object({
  cardNumber: z.string().min(13, "Card number must be at least 13 digits"),
  cardHolder: z.string().min(2, "Card holder name is required"),
  cvv: z.string().min(3, "CVV must be at least 3 digits"),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Invalid expiry month"),
  expiryYear: z.string().regex(/^20\d{2}$/, "Invalid expiry year"),
  paymentMethodId: z.string().optional(),
});

export async function processPayment(
  request: NextRequest,
  paymentId: string,
  paymentData: z.infer<typeof processPaymentBodySchema>
) {
  const supabase = createClient(request);

  // Get the payment from database
  const { data: payment, error: fetchError } = await supabase
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .single();

  if (fetchError) {
    throw new Error(`Payment not found: ${fetchError.message}`);
  }

  if (!payment) {
    throw new Error("Payment not found");
  }

  // Check if payment is already processed
  if (payment.status !== "PENDING") {
    throw new Error(`Payment is already ${payment.status?.toLowerCase() || "processed"}`);
  }

  // Prepare payment request for gateway
  const paymentRequest: PaymentRequest = {
    amount: payment.amount,
    currency: payment.currency,
    cardNumber: paymentData.cardNumber,
    cardHolder: paymentData.cardHolder,
    cvv: paymentData.cvv,
    expiryMonth: paymentData.expiryMonth,
    expiryYear: paymentData.expiryYear,
    paymentMethodId: paymentData.paymentMethodId,
  };

  // Validate card information
  const gateway = new PaymentGateway();
  const validation = gateway.validateCardInfo(paymentRequest);
  
  if (!validation.valid) {
    throw new Error(`Invalid payment information: ${validation.errors.join(", ")}`);
  }

  // Process payment through gateway
  const gatewayResponse = await gateway.processPayment(paymentRequest);

  // Update payment status based on gateway response
  const newStatus = gatewayResponse.success ? "SUCCESS" : "FAILURE";
  const updatedMeta = {
    ...((payment.meta as any) || {}),
    gateway_response: gatewayResponse.gatewayResponse,
    transaction_id: gatewayResponse.transactionId,
    error_code: gatewayResponse.errorCode,
    error_message: gatewayResponse.errorMessage,
    processed_at: new Date().toISOString(),
  };

  // Update payment in database
  const { data: updatedPayment, error: updateError } = await supabase
    .from("payments")
    .update({
      status: newStatus,
      meta: updatedMeta,
      modified_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .select("*")
    .single();

  if (updateError) {
    throw new Error(`Failed to update payment: ${updateError.message}`);
  }

  // Publish payment event
  try {
    const eventPublisher = getEventPublisher();
    
    if (gatewayResponse.success) {
      const completedEvent = createPaymentCompletedEvent(
        updatedPayment,
        gatewayResponse.transactionId,
        gatewayResponse.gatewayResponse
      );
      await eventPublisher.publishPaymentCompleted(completedEvent);
    } else {
      const failedEvent = createPaymentFailedEvent(
        updatedPayment,
        gatewayResponse.errorMessage || 'Payment was rejected',
        gatewayResponse.gatewayResponse
      );
      await eventPublisher.publishPaymentFailed(failedEvent);
    }
  } catch (eventError) {
    console.error('Failed to publish payment event:', eventError);
    // Don't throw here - payment was already processed successfully
  }

  return {
    payment: updatedPayment,
    gatewayResponse,
    success: gatewayResponse.success,
  };
}