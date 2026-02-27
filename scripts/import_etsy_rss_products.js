#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs");
const path = require("node:path");

const RSS_URL = process.env.ETSY_RSS_URL || "https://www.etsy.com/shop/neonstitchbyemily/rss";
const ETSY_API_KEY = process.env.ETSY_API_KEY;
const ETSY_SHOP_ID = process.env.ETSY_SHOP_ID;
const OUTPUT_PATH = path.join(process.cwd(), "src", "lib", "etsy-products.generated.json");

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferCategory(title) {
  const t = title.toLowerCase();
  if (t.includes("beanie") || t.includes("bucket hat") || t.includes("hat") || t.includes("headband")) {
    return "Hats";
  }
  if (t.includes("bag") || t.includes("tote") || t.includes("crossbody")) {
    return "Bags";
  }
  if (t.includes("top") || t.includes("shirt") || t.includes("dress") || t.includes("sweater")) {
    return "Clothing";
  }
  if (t.includes("scrunchie") || t.includes("glove") || t.includes("earring") || t.includes("bracelet")) {
    return "Accessories";
  }
  if (t.includes("blanket") || t.includes("coaster") || t.includes("hanger") || t.includes("home")) {
    return "Home";
  }
  return "Accessories";
}

function inferColors(title) {
  const t = title.toLowerCase();
  const out = [];
  if (t.includes("pink")) out.push("Hot Pink");
  if (t.includes("green")) out.push("Neon Green");
  if (t.includes("blue")) out.push("Electric Blue");
  if (t.includes("yellow")) out.push("Neon Yellow");
  if (t.includes("orange") || t.includes("pumpkin")) out.push("Neon Orange");
  if (t.includes("purple")) out.push("Neon Purple");
  if (t.includes("rainbow") || t.includes("multi")) out.push("Rainbow");
  return out.length > 0 ? out : ["Neon Multi"];
}

function parseItems(xml) {
  const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  return itemMatches.map((itemXml) => {
    const title = decodeHtml((itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "").trim());
    const link = (itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "").trim();
    const descRaw = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? "";
    const desc = decodeEntities(descRaw);
    const priceText =
      (desc.match(/<p\s+class="price">([\s\S]*?)<\/p>/i)?.[1] ??
        desc.match(/([0-9]+(?:\.[0-9]{2})?)\s*USD/i)?.[1] ??
        "0").trim();
    const image =
      (desc.match(/<img[\s\S]*?src="([^"]+)"/i)?.[1] ??
        desc.match(/https:\/\/i\.etsystatic\.com\/[^\s"'<]+/i)?.[0] ??
        "").trim();
    const rawDescription = desc.match(/<p\s+class="description">([\s\S]*?)<\/p>/i)?.[1] ?? "";
    const cleanDescription = decodeHtml(rawDescription).slice(0, 340);
    const listingId = link.match(/\/listing\/(\d+)\//)?.[1] ?? toSlug(title);

    return {
      id: `etsy-${listingId}`,
      sku: `etsy-${listingId}`,
      name: title.replace(/\s+by\s+NeonStitchByEmily$/i, "").trim(),
      description: cleanDescription || "Handmade item from Etsy.",
      price: Number.parseFloat(priceText) || 0,
      images: image ? [image] : [],
      category: inferCategory(title),
      colors: inferColors(title),
      inStock: true,
      quantity: 1,
      featured: false,
      etsyUrl: link,
    };
  });
}

function normalizeApiProduct(listing) {
  const title = listing.title ?? "Untitled";
  const imageUrl =
    listing.images?.[0]?.url_570xN ??
    listing.images?.[0]?.url_fullxfull ??
    listing.images?.[0]?.url_170x135 ??
    "";

  const listingId = String(listing.listing_id ?? toSlug(title));

  return {
    id: `etsy-${listingId}`,
    sku: `etsy-${listingId}`,
    name: title,
    description: decodeHtml(String(listing.description ?? "")).slice(0, 340) || "Handmade item from Etsy.",
    price: Number.parseFloat(String(listing.price ?? 0)) || 0,
    images: imageUrl ? [imageUrl] : [],
    category: inferCategory(title),
    colors: inferColors(title),
    inStock: Number(listing.quantity ?? 0) > 0,
    quantity: Number(listing.quantity ?? 0),
    featured: false,
    etsyUrl: listing.url || `https://www.etsy.com/listing/${listingId}`,
  };
}

async function fetchViaEtsyApi() {
  if (!ETSY_API_KEY || !ETSY_SHOP_ID) {
    return [];
  }

  const all = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const url = new URL(`https://openapi.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings/active`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("includes", "Images");

    const response = await fetch(url, {
      headers: {
        "x-api-key": ETSY_API_KEY,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Etsy API fetch failed (${response.status})`);
    }

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];
    all.push(...results);

    if (results.length < limit) {
      break;
    }
    offset += limit;
  }

  return all.map(normalizeApiProduct);
}

async function run() {
  let parsed = [];
  let source = "rss";

  if (ETSY_API_KEY && ETSY_SHOP_ID) {
    parsed = await fetchViaEtsyApi();
    source = "api";
  }

  if (parsed.length === 0) {
    const response = await fetch(RSS_URL, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; NeonStitchImporter/1.0)",
        accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Etsy RSS (${response.status})`);
    }

    const xml = await response.text();
    parsed = parseItems(xml);
    source = "rss";
  }

  if (parsed.length === 0) {
    throw new Error("No products parsed from Etsy source");
  }

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  console.log(`Wrote ${parsed.length} Etsy products to ${OUTPUT_PATH}`);
  if (source === "rss") {
    console.log(
      "Using Etsy RSS fallback (usually 10 recent listings). Set ETSY_API_KEY and ETSY_SHOP_ID to import all active listings."
    );
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
