import { PoolClient } from "pg";
import { dbQuery, withDbTransaction } from "@/lib/db/client";

export interface DeliveryRecord {
  deliveryKey: string;
  eventId: string;
  shopId: string;
  listingId: string;
  rawPayload: unknown;
  status: string;
}

export interface ListingMappingRow {
  tableName: "products" | "product_variants";
  rowId: number;
  etsyVariantId: string | null;
  sku: string | null;
  quantity: number;
}

export interface InventoryChange {
  tableName: "products" | "product_variants";
  rowId: number;
  prevQty: number;
  newQty: number;
  listingId: string;
  variantId: string | null;
  webhookDeliveryKey: string;
}

export async function upsertWebhookDelivery(record: DeliveryRecord): Promise<boolean> {
  const result = await dbQuery<{ inserted: boolean }>(
    `
      INSERT INTO webhook_deliveries (
        provider,
        delivery_key,
        event_id,
        shop_id,
        listing_id,
        raw_payload,
        status
      )
      VALUES ('etsy', $1, $2, $3, $4, $5::jsonb, $6)
      ON CONFLICT (delivery_key) DO NOTHING
      RETURNING true as inserted
    `,
    [
      record.deliveryKey,
      record.eventId,
      record.shopId,
      record.listingId,
      JSON.stringify(record.rawPayload),
      record.status,
    ]
  );

  return result.rowCount > 0;
}

export async function updateWebhookDeliveryStatus(
  deliveryKey: string,
  status: string,
  errorMessage?: string
): Promise<void> {
  await dbQuery(
    `
      UPDATE webhook_deliveries
      SET status = $2,
          error_message = $3,
          processed_at = CASE WHEN $2 IN ('completed', 'failed') THEN NOW() ELSE processed_at END,
          updated_at = NOW()
      WHERE delivery_key = $1
    `,
    [deliveryKey, status, errorMessage ?? null]
  );
}

export async function enqueueInventorySyncJob(params: {
  jobKey: string;
  shopId: string;
  listingId: string;
  webhookDeliveryKey: string;
}): Promise<boolean> {
  const result = await dbQuery(
    `
      INSERT INTO inventory_sync_jobs (
        job_key,
        status,
        provider,
        shop_id,
        listing_id,
        webhook_delivery_key,
        available_at
      )
      VALUES ($1, 'pending', 'etsy', $2, $3, $4, NOW())
      ON CONFLICT (job_key) DO NOTHING
      RETURNING id
    `,
    [params.jobKey, params.shopId, params.listingId, params.webhookDeliveryKey]
  );

  return result.rowCount > 0;
}

export async function reserveNextPendingJob(): Promise<
  | {
      id: number;
      shop_id: string;
      listing_id: string;
      webhook_delivery_key: string | null;
      attempts: number;
      max_attempts: number;
    }
  | null
> {
  const result = await dbQuery<{
    id: number;
    shop_id: string;
    listing_id: string;
    webhook_delivery_key: string | null;
    attempts: number;
    max_attempts: number;
  }>(
    `
      WITH next_job AS (
        SELECT id
        FROM inventory_sync_jobs
        WHERE status = 'pending'
          AND available_at <= NOW()
        ORDER BY available_at ASC, id ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      UPDATE inventory_sync_jobs j
      SET status = 'running',
          started_at = NOW(),
          attempts = attempts + 1,
          updated_at = NOW()
      FROM next_job
      WHERE j.id = next_job.id
      RETURNING j.id, j.shop_id, j.listing_id, j.webhook_delivery_key, j.attempts, j.max_attempts
    `
  );

  return result.rows[0] ?? null;
}

export async function markJobCompleted(id: number): Promise<void> {
  await dbQuery(
    `
      UPDATE inventory_sync_jobs
      SET status = 'completed',
          completed_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
    `,
    [id]
  );
}

export async function markJobFailed(params: {
  id: number;
  attempts: number;
  maxAttempts: number;
  errorMessage: string;
}): Promise<void> {
  const shouldRetry = params.attempts < params.maxAttempts;
  const delaySeconds = Math.min(300, 2 ** params.attempts);

  await dbQuery(
    `
      UPDATE inventory_sync_jobs
      SET status = $2,
          available_at = CASE WHEN $2 = 'pending' THEN NOW() + ($3 || ' seconds')::interval ELSE available_at END,
          last_error = $4,
          updated_at = NOW()
      WHERE id = $1
    `,
    [params.id, shouldRetry ? "pending" : "failed", delaySeconds, params.errorMessage]
  );
}

export async function getListingMappings(shopId: string, listingId: string): Promise<ListingMappingRow[]> {
  const variants = await dbQuery<ListingMappingRow>(
    `
      SELECT 'product_variants'::text as "tableName",
             id as "rowId",
             etsy_variant_id as "etsyVariantId",
             sku,
             quantity
      FROM product_variants
      WHERE etsy_shop_id = $1
        AND etsy_listing_id = $2
    `,
    [shopId, listingId]
  );

  if (variants.rowCount > 0) {
    return variants.rows;
  }

  const products = await dbQuery<ListingMappingRow>(
    `
      SELECT 'products'::text as "tableName",
             id as "rowId",
             etsy_variant_id as "etsyVariantId",
             sku,
             quantity
      FROM products
      WHERE etsy_shop_id = $1
        AND etsy_listing_id = $2
    `,
    [shopId, listingId]
  );

  return products.rows;
}

async function updateQuantity(client: PoolClient, change: InventoryChange): Promise<void> {
  if (change.tableName === "product_variants") {
    await client.query(
      `
        UPDATE product_variants
        SET quantity = $2,
            updated_at = NOW()
        WHERE id = $1
      `,
      [change.rowId, change.newQty]
    );
  } else {
    await client.query(
      `
        UPDATE products
        SET quantity = $2,
            updated_at = NOW()
        WHERE id = $1
      `,
      [change.rowId, change.newQty]
    );
  }
}

export async function applyInventoryChanges(changes: InventoryChange[]): Promise<void> {
  if (changes.length === 0) {
    return;
  }

  await withDbTransaction(async (client) => {
    for (const change of changes) {
      await updateQuantity(client, change);
      await client.query(
        `
          INSERT INTO inventory_events (
            source,
            listing_id,
            variant_id,
            product_id,
            product_variant_id,
            prev_qty,
            new_qty,
            occurred_at,
            webhook_delivery_key,
            metadata
          )
          VALUES (
            'etsy',
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            NOW(),
            $7,
            '{}'::jsonb
          )
        `,
        [
          change.listingId,
          change.variantId,
          change.tableName === "products" ? change.rowId : null,
          change.tableName === "product_variants" ? change.rowId : null,
          change.prevQty,
          change.newQty,
          change.webhookDeliveryKey,
        ]
      );
    }
  });
}

export async function recordUnmappedInventory(params: {
  shopId: string;
  listingId: string;
  variantId: string | null;
  sku: string | null;
  quantity: number;
  webhookDeliveryKey: string;
  payload: unknown;
}): Promise<void> {
  await dbQuery(
    `
      INSERT INTO inventory_unmapped (
        source,
        shop_id,
        listing_id,
        variant_id,
        sku,
        quantity,
        webhook_delivery_key,
        payload
      )
      VALUES ('etsy', $1, $2, $3, $4, $5, $6, $7::jsonb)
    `,
    [
      params.shopId,
      params.listingId,
      params.variantId,
      params.sku,
      params.quantity,
      params.webhookDeliveryKey,
      JSON.stringify(params.payload),
    ]
  );
}

export async function getEtsySyncStatus(): Promise<{
  lastWebhookAt: string | null;
  lastSuccessfulSyncAt: string | null;
  queueDepth: number;
}> {
  const [webhook, sync, depth] = await Promise.all([
    dbQuery<{ ts: string | null }>(
      `SELECT MAX(received_at)::text AS ts FROM webhook_deliveries WHERE provider = 'etsy'`
    ),
    dbQuery<{ ts: string | null }>(
      `SELECT MAX(completed_at)::text AS ts FROM inventory_sync_jobs WHERE provider = 'etsy' AND status = 'completed'`
    ),
    dbQuery<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM inventory_sync_jobs WHERE provider = 'etsy' AND status IN ('pending', 'running')`
    ),
  ]);

  return {
    lastWebhookAt: webhook.rows[0]?.ts ?? null,
    lastSuccessfulSyncAt: sync.rows[0]?.ts ?? null,
    queueDepth: Number(depth.rows[0]?.total ?? "0"),
  };
}

export async function getStoreInventoryBySku(): Promise<Record<string, number>> {
  const rows = await dbQuery<{ sku: string | null; quantity: number }>(
    `
      SELECT sku, quantity
      FROM products
      WHERE sku IS NOT NULL
    `
  );

  const out: Record<string, number> = {};
  for (const row of rows.rows) {
    if (!row.sku) {
      continue;
    }
    out[row.sku] = row.quantity;
  }
  return out;
}
