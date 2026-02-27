import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyEtsyWebhookSignature } from "../../src/lib/integrations/etsy/signature";

describe("Etsy webhook signature", () => {
  it("validates a correct HMAC signature", () => {
    const payload = JSON.stringify({ hello: "world" });
    const secret = "test-secret";
    const digest = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    const valid = verifyEtsyWebhookSignature({
      signature: `sha256=${digest}`,
      payload,
      secret,
    });

    expect(valid).toBe(true);
  });

  it("rejects an invalid signature", () => {
    const valid = verifyEtsyWebhookSignature({
      signature: "sha256=invalid",
      payload: "{}",
      secret: "test-secret",
    });

    expect(valid).toBe(false);
  });
});
