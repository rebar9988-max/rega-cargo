#!/usr/bin/env node
// Wrangler refuses a tool-generated ("redirected") config that still contains
// `env` blocks, but Nitro copies wrangler.jsonc — including `env.staging` —
// into .output/server/wrangler.json. After the build we therefore:
//   1. strip `env` from .output/server/wrangler.json (production, used by
//      `npm run deploy` / `cf:dry-run` via the redirect), and
//   2. write one flattened file per environment, e.g.
//      .output/server/wrangler.staging.json, deployed with an explicit `-c`.
// Flattening follows Wrangler semantics: keys set in the environment replace
// the top-level value; everything else (main, assets, compatibility, …) is
// inherited.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function splitEnvironments(config) {
  const { env = {}, ...base } = config;
  const environments = {};
  for (const [name, overrides] of Object.entries(env)) {
    environments[name] = { ...base, ...overrides };
  }
  return { production: base, environments };
}

function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const file = join(root, ".output/server/wrangler.json");
  if (!existsSync(file)) return;
  const { production, environments } = splitEnvironments(JSON.parse(readFileSync(file, "utf8")));
  writeFileSync(file, `${JSON.stringify(production, null, 2)}\n`);
  for (const [name, cfg] of Object.entries(environments)) {
    writeFileSync(
      join(root, `.output/server/wrangler.${name}.json`),
      `${JSON.stringify(cfg, null, 2)}\n`,
    );
  }
  console.log(
    `[split-wrangler-env] production + ${Object.keys(environments).join(", ") || "no environments"}`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
