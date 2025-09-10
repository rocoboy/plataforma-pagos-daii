import { NextResponse } from "next/server";
import type { Booking } from "../../../../../../packages/types/booking"; //habria que ver por que no me toma los types 

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Booking>;
  if (!body?.id) {
    return NextResponse.json(
      { ok: false, error: { code: "BAD_REQUEST", message: "id de reserva requerido" } },
      { status: 400 }
    );
  }

  const booking = db.bookings.get(body.id);
  if (!booking) {
    return NextResponse.json(
      { ok: false, error: { code: "NOT_FOUND", message: "Reserva no encontrada" } },
      { status: 404 }
    );
  }

  if (body.status) {
    booking.status = body.status;
    booking.updated_at = now();
    db.bookings.set(booking.id, booking);

     for (const payment of db.payments.values()) {
      if (payment.booking_id === booking.id) {
        if (body.status === "approved" as Booking["status"]) {
          payment.status = "approved" as typeof payment.status;
        } else if (body.status === "cancelled" as Booking["status"]) {
          payment.status = "rejected" as typeof payment.status;
        }
        payment.updated_at = now();
        db.payments.set(payment.id, payment);
      }
    }
  }

  return NextResponse.json({ ok: true, value: { booking } });
}