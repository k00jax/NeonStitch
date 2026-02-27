import { NextResponse } from "next/server";
import { getEtsySyncStatus } from "@/lib/integrations/etsy/repository";
import { getAllMetrics } from "@/lib/observability";

export async function GET() {
  try {
    const status = await getEtsySyncStatus();

    return NextResponse.json(
      {
        provider: "etsy",
        ...status,
        metrics: getAllMetrics(),
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read Etsy status";

    return NextResponse.json(
      {
        error: "Failed to load Etsy integration status",
        message,
      },
      { status: 500 }
    );
  }
}
