import { EtsyListingInventory } from "./schema";
import { ListingMappingRow, InventoryChange } from "./repository";

export interface EtsyOfferingSnapshot {
  variantId: string | null;
  sku: string | null;
  quantity: number;
  raw: unknown;
}

export function flattenEtsyInventory(inventory: EtsyListingInventory): EtsyOfferingSnapshot[] {
  return (inventory.products ?? []).map((product) => {
    const firstOffering = product.offerings?.[0];
    const variantId = product.product_id ? String(product.product_id) : null;
    const sku = product.sku?.[0] ?? null;
    const quantity = Number(firstOffering?.quantity ?? 0);

    return {
      variantId,
      sku,
      quantity: Number.isFinite(quantity) ? quantity : 0,
      raw: product,
    };
  });
}

export function buildInventoryChanges(params: {
  mappings: ListingMappingRow[];
  listingId: string;
  webhookDeliveryKey: string;
  remoteSnapshots: EtsyOfferingSnapshot[];
}): { changes: InventoryChange[]; unmapped: EtsyOfferingSnapshot[] } {
  const byVariantId = new Map<string, ListingMappingRow>();
  const bySku = new Map<string, ListingMappingRow>();

  for (const row of params.mappings) {
    if (row.etsyVariantId) {
      byVariantId.set(row.etsyVariantId, row);
    }
    if (row.sku) {
      bySku.set(row.sku, row);
    }
  }

  const changes: InventoryChange[] = [];
  const unmapped: EtsyOfferingSnapshot[] = [];

  for (const snapshot of params.remoteSnapshots) {
    const local =
      (snapshot.variantId ? byVariantId.get(snapshot.variantId) : undefined) ??
      (snapshot.sku ? bySku.get(snapshot.sku) : undefined);

    if (!local) {
      unmapped.push(snapshot);
      continue;
    }

    if (local.quantity === snapshot.quantity) {
      continue;
    }

    changes.push({
      tableName: local.tableName,
      rowId: local.rowId,
      prevQty: local.quantity,
      newQty: snapshot.quantity,
      listingId: params.listingId,
      variantId: snapshot.variantId,
      webhookDeliveryKey: params.webhookDeliveryKey,
    });
  }

  return { changes, unmapped };
}
