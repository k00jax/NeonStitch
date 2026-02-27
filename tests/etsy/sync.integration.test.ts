import { describe, expect, it } from "vitest";
import { syncListingInventory } from "../../src/lib/integrations/etsy/syncService";

describe("Etsy sync integration", () => {
  it("updates inventory and records events through dependency hooks", async () => {
    const applied: unknown[] = [];
    const unmapped: unknown[] = [];

    const result = await syncListingInventory({
      shopId: "shop-1",
      listingId: "listing-1",
      webhookDeliveryKey: "delivery-1",
      deps: {
        fetchListingInventory: async () => ({
          products: [
            {
              product_id: "variant-1",
              sku: ["sku-1"],
              offerings: [{ quantity: 9 }],
            },
          ],
        }),
        getMappings: async () => [
          {
            tableName: "product_variants" as const,
            rowId: 21,
            etsyVariantId: "variant-1",
            sku: "sku-1",
            quantity: 2,
          },
        ],
        applyChanges: async (changes) => {
          applied.push(...changes);
        },
        recordUnmapped: async (entry) => {
          unmapped.push(entry);
        },
      },
    });

    expect(result.changesCount).toBe(1);
    expect(result.unmappedCount).toBe(0);
    expect(applied).toHaveLength(1);
    expect(unmapped).toHaveLength(0);
  });
});
