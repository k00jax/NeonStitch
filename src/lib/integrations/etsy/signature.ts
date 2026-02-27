import crypto from "crypto";

export function verifyEtsyWebhookSignature(params: {
  signature: string | null;
  payload: string;
  secret: string | undefined;
}): boolean {
  if (!params.secret || !params.signature) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", params.secret)
    .update(params.payload)
    .digest("hex");

  const normalizedSignature = params.signature.replace(/^sha256=/, "");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(normalizedSignature, "utf8")
    );
  } catch {
    return false;
  }
}

export function hashDeliveryKey(parts: string[]): string {
  return crypto.createHash("sha256").update(parts.join(":"), "utf8").digest("hex");
}
