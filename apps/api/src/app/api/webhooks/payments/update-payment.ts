import { NextRequest } from "next/server";
import { PaymentStatus } from "./create-payment";
import { createClient } from "@/lib/supabase/server";
import { Constants } from "@/lib/supabase/schema";
import { EventPublisher } from "@/lib/event-publisher";
import z from "zod";

export const updatePaymentBodySchema = z.object({
  id: z.string(),
  status: z.enum(Constants.public.Enums.payment_status),
});

export async function updatePayment(
  request: NextRequest,
  id: string,
  status: PaymentStatus
) {
  const supabase = createClient(request);

  const { data, error } = await supabase
    .from("payments")
    .update({ status, modified_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  // Publish appropriate event based on status change
  try {
    const eventPublisher = new EventPublisher();
    
    const eventData = {
      id: data.id,
      reservationId: data.res_id,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      userId: data.user_id,
      meta: data.meta,
      timestamp: new Date().toISOString()
    };

    switch (status) {
      case 'SUCCESS':
        await eventPublisher.publishPaymentCompleted(eventData);
        break;
      case 'FAILURE':
        await eventPublisher.publishPaymentFailed(eventData);
        break;
      case 'REFUND':
        await eventPublisher.publishPaymentRefunded(eventData);
        break;
      case 'EXPIRED':
        await eventPublisher.publishPaymentExpired(eventData);
        break;
      case 'UNDERPAID':
        await eventPublisher.publishPaymentUnderpaid(eventData);
        break;
      case 'OVERPAID':
        await eventPublisher.publishPaymentOverpaid(eventData);
        break;
      // PENDING doesn't need an event as it's the initial state
    }

    await eventPublisher.close();
  } catch (eventError) {
    console.error('Failed to publish payment status event:', eventError);
    // Don't throw here - payment update succeeded, event is secondary
  }

  return data;
}
