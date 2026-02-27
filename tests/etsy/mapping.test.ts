import { describe, expect, it } from "vitest";
import { buildInventoryChanges, flattenEtsyInventory } from "../../src/lib/integrations/etsy/mapping";

describe("Etsy inventory mapping", () => {
  it("maps by variant id then sku and emits change records", () => {
    const snapshots = flattenEtsyInventory({
      products: [
        {
          product_id: 100,
          sku: ["sku-a"],
          offerings: [{ quantity: 7 }],
        },
        {
          product_id: 200,
          sku: ["sku-b"],
          offerings: [{ quantity: 4 }],
        },
      ],
    });

    const { changes, unmapped } = buildInventoryChanges({
      listingId: "listing-1",
      webhookDeliveryKey: "delivery-1",
      remoteSnapshots: snapshots,
      mappings: [
        {
          tableName: "product_variants",
          rowId: 11,
          etsyVariantId: "100",
          sku: "sku-a",
          quantity: 3,
        },
      ],
    });

    expect(changes).toHaveLength(1);
    expect(changes[0].newQty).toBe(7);
    expect(unmapped).toHaveLength(1);
    expect(unmapped[0].sku).toBe("sku-b");
  });
});
