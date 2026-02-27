import { buildInventoryChanges, flattenEtsyInventory } from "./mapping";
import { EtsyListingInventory } from "./schema";
import { ListingMappingRow } from "./repository";

export interface EtsySyncDeps {
  fetchListingInventory: (listingId: string) => Promise<EtsyListingInventory>;
  getMappings: (shopId: string, listingId: string) => Promise<ListingMappingRow[]>;
  applyChanges: (changes: {
    tableName: "products" | "product_variants";
    rowId: number;
    prevQty: number;
    newQty: number;
    listingId: string;
    variantId: string | null;
    webhookDeliveryKey: string;
  }[]) => Promise<void>;
  recordUnmapped: (entry: {
    shopId: string;
    listingId: string;
    variantId: string | null;
    sku: string | null;
    quantity: number;
    webhookDeliveryKey: string;
    payload: unknown;
  }) => Promise<void>;
}

export async function syncListingInventory(params: {
  shopId: string;
  listingId: string;
  webhookDeliveryKey: string;
  deps: EtsySyncDeps;
}): Promise<{ changesCount: number; unmappedCount: number }> {
  const inventory = await params.deps.fetchListingInventory(params.listingId);
  const remoteSnapshots = flattenEtsyInventory(inventory);
  const mappings = await params.deps.getMappings(params.shopId, params.listingId);

  const { changes, unmapped } = buildInventoryChanges({
    mappings,
    listingId: params.listingId,
    webhookDeliveryKey: params.webhookDeliveryKey,
    remoteSnapshots,
  });

  await params.deps.applyChanges(changes);

  for (const row of unmapped) {
    await params.deps.recordUnmapped({
      shopId: params.shopId,
      listingId: params.listingId,
      variantId: row.variantId,
      sku: row.sku,
      quantity: row.quantity,
      webhookDeliveryKey: params.webhookDeliveryKey,
      payload: row.raw,
    });
  }

  return {
    changesCount: changes.length,
    unmappedCount: unmapped.length,
  };
}
