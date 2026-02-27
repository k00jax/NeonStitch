import { NextRequest, NextResponse } from "next/server";
import { etsyWebhookPayloadSchema } from "@/lib/integrations/etsy/schema";
import { verifyEtsyWebhookSignature } from "@/lib/integrations/etsy/signature";
import {
  enqueueInventorySyncJob,
  updateWebhookDeliveryStatus,
  upsertWebhookDelivery,
} from "@/lib/integrations/etsy/repository";
import { persistAndEnqueueWebhook } from "@/lib/integrations/etsy/webhookService";
import { incrementMetric, logEvent } from "@/lib/observability";

export async function POST(request: NextRequest) {
  incrementMetric("webhooks_total");

  const rawPayload = await request.text();
  const signature = request.headers.get("x-etsy-signature");
  const secret = process.env.ETSY_WEBHOOK_SIGNING_SECRET;

  logEvent("info", "webhook_received", {
    provider: "etsy",
  });

  const isValidSignature = verifyEtsyWebhookSignature({
    signature,
    payload: rawPayload,
    secret,
  });

  if (!isValidSignature) {
    incrementMetric("webhooks_failed_total");
    logEvent("warn", "webhook_rejected", {
      provider: "etsy",
      reason: "invalid_signature",
    });

    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawPayload);
  } catch {
    incrementMetric("webhooks_failed_total");
    logEvent("warn", "webhook_rejected", {
      provider: "etsy",
      reason: "invalid_json",
    });

    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payloadResult = etsyWebhookPayloadSchema.safeParse(parsed);
  if (!payloadResult.success) {
    incrementMetric("webhooks_failed_total");
    logEvent("warn", "webhook_rejected", {
      provider: "etsy",
      reason: "invalid_schema",
    });

    return NextResponse.json({ error: "Invalid payload schema" }, { status: 400 });
  }

  const payload = payloadResult.data;

  try {
    const outcome = await persistAndEnqueueWebhook(payload, {
      upsertDelivery: async ({ deliveryKey, eventId, shopId, listingId, payload: webhookPayload }) =>
        upsertWebhookDelivery({
          deliveryKey,
          eventId,
          shopId,
          listingId,
          rawPayload: webhookPayload,
          status: "received",
        }),
      enqueueSyncJob: async ({ jobKey, shopId, listingId, deliveryKey }) => {
        await enqueueInventorySyncJob({
          jobKey,
          shopId,
          listingId,
          webhookDeliveryKey: deliveryKey,
        });
      },
    });

    if (outcome.deduped) {
      incrementMetric("webhooks_verified_total");
      logEvent("info", "webhook_verified", {
        provider: "etsy",
        deduped: true,
        listing_id: outcome.listingId,
      });

      return NextResponse.json({ ok: true, deduped: true }, { status: 200 });
    }

    incrementMetric("webhooks_verified_total");
    logEvent("info", "webhook_verified", {
      provider: "etsy",
      listing_id: outcome.listingId,
      delivery_key: outcome.deliveryKey,
    });

    logEvent("info", "job_enqueued", {
      provider: "etsy",
      listing_id: outcome.listingId,
      delivery_key: outcome.deliveryKey,
    });

    await updateWebhookDeliveryStatus(outcome.deliveryKey, "enqueued");

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    incrementMetric("webhooks_failed_total");
    const message = error instanceof Error ? error.message : "Unknown webhook processing error";

    logEvent("error", "webhook_rejected", {
      provider: "etsy",
      reason: "processing_error",
      error: message,
    });

    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
