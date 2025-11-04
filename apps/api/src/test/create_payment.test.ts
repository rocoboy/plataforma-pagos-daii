import { describe, expect, test } from "bun:test";

describe("create payment webhook", () => {
  const baseUrl = Bun.env.API_BASE_URL ?? "http://localhost:3000";
  const endpoint = new URL("events", baseUrl).toString();

  test("should call create payment webhook endpoint", async () => {


    const randResId = crypto.randomUUID();
    const randUserId = crypto.randomUUID();
    const randAmount = Math.floor(Math.random() * 10000) + 1;

    const innerPaymentData = { // datos nuestros de pago
      paymentId: `pay-${crypto.randomUUID()}`,
      reservationId: randResId,
      userId: randUserId,
      status: "SUCCESS",
      amount: randAmount,
      currency: "USD",
      updatedAt: new Date().toISOString(),
    };

    const payload = { //esto lo saque de otros mensajes que ya mandamos para poder ver porque no funcionaba
      messageId: `msg-${crypto.randomUUID()}`,
      eventType: "payments.payment.status_updated",
      schemaVersion: "1.0",
      occurredAt: new Date().toISOString(),
      producer: "bun-test",
      correlationId: `corr-${crypto.randomUUID()}`,
      idempotencyKey: `idem-${crypto.randomUUID()}`,
      
      payload: JSON.stringify(innerPaymentData),
    };

    console.log("➡️  Calling", endpoint, "with payload:", payload);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "http://localhost:3000",
        "X-API-Key": "microservices-api-key-2024-secure" //esto es lo que tenemos que cambiar
      },
      body: JSON.stringify(payload),
    });

    const responseBody = await response.json().catch(() => ({ raw: "<non-json response>" }));

    console.log("⬅️  Response status:", response.status);
    console.log("⬅️  Response body:", responseBody);

    expect(response).toBeDefined();
  }, {timeout: 20000});
});
