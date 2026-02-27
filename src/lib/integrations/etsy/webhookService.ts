import { hashDeliveryKey } from "./signature";
import { EtsyWebhookPayload } from "./schema";

export interface WebhookPersistence {
  upsertDelivery: (params: {
    deliveryKey: string;
    eventId: string;
    shopId: string;
    listingId: string;
    payload: EtsyWebhookPayload;
  }) => Promise<boolean>;
  enqueueSyncJob: (params: {
    jobKey: string;
    shopId: string;
    listingId: string;
    deliveryKey: string;
  }) => Promise<void>;
}

export function deriveDeliveryKey(payload: EtsyWebhookPayload): string {
  if (payload.delivery_id) {
    return String(payload.delivery_id);
  }

  return hashDeliveryKey([
    payload.event_id,
    String(payload.listing_id),
    String(payload.timestamp),
  ]);
}

export async function persistAndEnqueueWebhook(
  payload: EtsyWebhookPayload,
  deps: WebhookPersistence
): Promise<{ deduped: boolean; deliveryKey: string; listingId: string; shopId: string }> {
  const shopId = String(payload.shop_id);
  const listingId = String(payload.listing_id);
  const deliveryKey = deriveDeliveryKey(payload);

  const inserted = await deps.upsertDelivery({
    deliveryKey,
    eventId: payload.event_id,
    shopId,
    listingId,
    payload,
  });

  if (!inserted) {
    return {
      deduped: true,
      deliveryKey,
      listingId,
      shopId,
    };
  }

  await deps.enqueueSyncJob({
    jobKey: `etsy:${shopId}:${listingId}:${deliveryKey}`,
    shopId,
    listingId,
    deliveryKey,
  });

  return {
    deduped: false,
    deliveryKey,
    listingId,
    shopId,
  };
}
