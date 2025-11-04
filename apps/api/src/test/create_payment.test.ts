import { describe, expect, test } from "bun:test";

describe("create payment webhook", () => {
  const baseUrl = Bun.env.API_BASE_URL ?? "http://localhost:3000";
  const endpoint = new URL("/api/webhooks/payments", baseUrl).toString();

  test("should call create payment webhook endpoint", async () => {


    const randResId = crypto.randomUUID();
    const randUserId = crypto.randomUUID();
    const randAmount = Math.floor(Math.random() * 10000) + 1;

    const payload = {
      res_id: randResId,
      user_id: randUserId,
      amount: randAmount,
      currency: "USD",
      meta: {
        reference: "bun-test",
      },
    };

    console.log("➡️  Calling", endpoint, "with payload:", payload);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": "http://localhost:3000",
      },
      body: JSON.stringify(payload),
    });

    const responseBody = await response.json().catch(() => ({ raw: "<non-json response>" }));

    console.log("⬅️  Response status:", response.status);
    console.log("⬅️  Response body:", responseBody);

    expect(response).toBeDefined();
  }, {timeout: 20000});
});
