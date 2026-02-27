import { runEtsyInventoryWorker } from "@/lib/queue/etsyInventorySync";
import { logEvent } from "@/lib/observability";

async function main() {
  const runOnce = process.argv.includes("--once");

  logEvent("info", "etsy_worker_started", {
    mode: runOnce ? "once" : "continuous",
  });

  await runEtsyInventoryWorker({
    maxJobs: runOnce ? 1 : Number.POSITIVE_INFINITY,
    idleDelayMs: 1000,
  });
}

main().catch((error) => {
  logEvent("error", "etsy_worker_crashed", {
    error: error instanceof Error ? error.message : "Unknown worker error",
  });
  process.exit(1);
});
