import { NextResponse } from "next/server";
import { getStoreInventoryBySku } from "@/lib/integrations/etsy/repository";

export async function GET() {
  try {
    const inventory = await getStoreInventoryBySku();
    return NextResponse.json({ inventory }, { status: 200 });
  } catch {
    return NextResponse.json({ inventory: {} }, { status: 200 });
  }
}
