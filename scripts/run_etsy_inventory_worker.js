#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const { spawn } = require("node:child_process");

const runOnce = process.argv.includes("--once");
const args = ["tsx", "src/workers/etsyInventoryWorker.ts"];
if (runOnce) {
  args.push("--once");
}

const child = spawn("npx", args, {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
