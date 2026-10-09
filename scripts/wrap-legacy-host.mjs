#!/usr/bin/env node
// After `vite build`: put a thin entry in front of Nitro's Worker entry so the
// old production host (rega-cargo.<subdomain>.workers.dev) is answered with a
// 301 / self-unregistering service worker before Nitro serves anything —
// including public assets, which Nitro serves ahead of its middleware. Also
// routes the few static files that could keep the old host alive (sw.js,
// manifest, offline.html) to the Worker instead of the asset server.
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WORKER_FIRST_PATHS } from "./legacy-host.mjs";

export const ENTRY = "legacy-host-entry.mjs";

export function entrySource(innerMain) {
  return `import inner from "./${innerMain}";
import { wrapWorker } from "./legacy-host.mjs";
export * from "./${innerMain}";
export default wrapWorker(inner);
`;
}

export function patchConfig(config) {
  const runFirst = new Set([...(Array.isArray(config.assets?.run_worker_first) ? config.assets.run_worker_first : []), ...WORKER_FIRST_PATHS]);
  return { ...config, main: ENTRY, assets: { ...config.assets, run_worker_first: [...runFirst] } };
}

function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const file = join(root, ".output/server/wrangler.json");
  if (!existsSync(file)) return;
  const config = JSON.parse(readFileSync(file, "utf8"));
  if (config.main === ENTRY) return; // already wrapped
  copyFileSync(join(root, "scripts/legacy-host.mjs"), join(root, ".output/server/legacy-host.mjs"));
  writeFileSync(join(root, ".output/server", ENTRY), entrySource(config.main));
  writeFileSync(file, `${JSON.stringify(patchConfig(config), null, 2)}\n`);
  console.log(`[wrap-legacy-host] main=${ENTRY} (inner ${config.main})`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
