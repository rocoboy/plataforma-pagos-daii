import { NextRequest } from "next/server";
import { updatePaymentByReservationId } from "../payments/update-payment";
import { createCorsResponse } from "@/lib/cors";
import { publishPaymentStatusUpdated } from "@/lib/core";
import { PaymentStatus } from "../../../../../../types/payments";
import { ISODateTime } from "../../../../../../types/common";

// Handler for reservations.reservation.updated webhook
//
// Expected event structure:
// {
//   "reservationId": "364",
//   "newStatus": "PENDING_REFUND",
//   "reservationDate": "2025-11-23T18:20:16.000Z",
//   "flightDate": "2025-12-22T00:00:00.000Z"
// }
// Event name: reservations.reservation.updated
export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const { reservationId, newStatus } = json;

    if (!reservationId || !newStatus) {
      return createCorsResponse(request, {
        success: false,
        error: "Missing reservationId or newStatus"
      }, 400);
    }

    // Only map PENDING_REFUND to REFUND
    if (newStatus === "PENDING_REFUND") {
      const payment = await updatePaymentByReservationId(reservationId, "REFUND" as PaymentStatus);
      if (payment) {
        await publishPaymentStatusUpdated({
          paymentId: payment.id,
          reservationId: payment.res_id,
          userId: payment.user_id,
          status: payment.status as PaymentStatus,
          amount: payment.amount,
          currency: payment.currency,
          updatedAt: new Date().toISOString() as ISODateTime,
        });
        return createCorsResponse(request, { success: true, payment });
      } else {
        return createCorsResponse(request, { success: false, error: "Payment not found" }, 404);
      }
    }

    // Ignore other statuses
    return createCorsResponse(request, { success: true, message: "No action for this status" });
  } catch (error) {
    return createCorsResponse(request, {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
}
