import { describe, expect, it } from "vitest";
import { persistAndEnqueueWebhook } from "../../src/lib/integrations/etsy/webhookService";

describe("Webhook idempotency", () => {
  it("processes the same delivery only once", async () => {
    const seen = new Set<string>();
    let enqueueCount = 0;

    const payload = {
      event_id: "evt_1",
      event_type: "listing_inventory_updated",
      timestamp: 1761732000,
      shop_id: "shop_1",
      listing_id: "listing_1",
      delivery_id: "delivery_1",
    };

    const deps = {
      upsertDelivery: async ({ deliveryKey }: { deliveryKey: string }) => {
        if (seen.has(deliveryKey)) {
          return false;
        }
        seen.add(deliveryKey);
        return true;
      },
      enqueueSyncJob: async () => {
        enqueueCount += 1;
      },
    };

    const first = await persistAndEnqueueWebhook(payload, deps);
    const second = await persistAndEnqueueWebhook(payload, deps);

    expect(first.deduped).toBe(false);
    expect(second.deduped).toBe(true);
    expect(enqueueCount).toBe(1);
  });
});
