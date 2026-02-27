#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const args = process.argv.slice(2);
const payloadFile = args[0] || path.join(process.cwd(), "tests", "etsy", "fixtures", "etsy-webhook-sample.json");
const webhookUrl = process.env.ETSY_WEBHOOK_URL || "http://localhost:3000/api/webhooks/etsy";
const secret = process.env.ETSY_WEBHOOK_SIGNING_SECRET || "";

if (!secret) {
  console.error("ETSY_WEBHOOK_SIGNING_SECRET is required");
  process.exit(1);
}

const payload = fs.readFileSync(payloadFile, "utf8");
const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

fetch(webhookUrl, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-etsy-signature": `sha256=${signature}`,
  },
  body: payload,
})
  .then(async (response) => {
    const body = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(body);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
