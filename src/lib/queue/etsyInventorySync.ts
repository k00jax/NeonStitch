import { EtsyApiClient } from "@/lib/integrations/etsy/client";
import {
  applyInventoryChanges,
  getListingMappings,
  markJobCompleted,
  markJobFailed,
  recordUnmappedInventory,
  reserveNextPendingJob,
  updateWebhookDeliveryStatus,
} from "@/lib/integrations/etsy/repository";
import { syncListingInventory } from "@/lib/integrations/etsy/syncService";
import { incrementMetric, logEvent } from "@/lib/observability";

export async function processOneEtsyInventorySyncJob(): Promise<boolean> {
  const job = await reserveNextPendingJob();
  if (!job) {
    return false;
  }

  const webhookDeliveryKey = job.webhook_delivery_key ?? "unknown";

  logEvent("info", "job_started", {
    provider: "etsy",
    listing_id: job.listing_id,
    webhook_delivery_key: webhookDeliveryKey,
  });

  try {
    const etsyClient = new EtsyApiClient();
    const result = await syncListingInventory({
      shopId: job.shop_id,
      listingId: job.listing_id,
      webhookDeliveryKey,
      deps: {
        fetchListingInventory: (listingId) => etsyClient.getListingInventory(listingId),
        getMappings: (shopId, listingId) => getListingMappings(shopId, listingId),
        applyChanges: (changes) => applyInventoryChanges(changes),
        recordUnmapped: (entry) => recordUnmappedInventory(entry),
      },
    });

    await markJobCompleted(job.id);
    await updateWebhookDeliveryStatus(webhookDeliveryKey, "completed");

    incrementMetric("inventory_sync_success_total");
    logEvent("info", "job_completed", {
      provider: "etsy",
      listing_id: job.listing_id,
      changes_count: result.changesCount,
      unmapped_count: result.unmappedCount,
      webhook_delivery_key: webhookDeliveryKey,
    });

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown Etsy sync error";

    await markJobFailed({
      id: job.id,
      attempts: job.attempts,
      maxAttempts: job.max_attempts,
      errorMessage,
    });

    await updateWebhookDeliveryStatus(webhookDeliveryKey, "failed", errorMessage);

    incrementMetric("inventory_sync_failure_total");
    logEvent("error", "job_failed", {
      provider: "etsy",
      listing_id: job.listing_id,
      webhook_delivery_key: webhookDeliveryKey,
      error: errorMessage,
    });

    return true;
  }
}

export async function runEtsyInventoryWorker(options?: {
  maxJobs?: number;
  idleDelayMs?: number;
}): Promise<void> {
  const maxJobs = options?.maxJobs ?? Number.POSITIVE_INFINITY;
  const idleDelayMs = options?.idleDelayMs ?? 1000;
  let processed = 0;

  while (processed < maxJobs) {
    const didWork = await processOneEtsyInventorySyncJob();
    if (!didWork) {
      if (!Number.isFinite(maxJobs)) {
        await new Promise((resolve) => setTimeout(resolve, idleDelayMs));
        continue;
      }
      break;
    }
    processed += 1;
  }
}
