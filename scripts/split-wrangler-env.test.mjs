import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { splitEnvironments } from "./split-wrangler-env.mjs";

const generated = {
  name: "rega-cargo",
  main: "index.mjs",
  assets: { binding: "ASSETS", directory: "../public" },
  compatibility_date: "2025-09-15",
  vars: { BETTER_AUTH_URL: "https://cargo.regaplatform.com", RL_AI_ENABLED: "false" },
  env: {
    staging: {
      name: "rega-cargo-staging",
      vars: { RL_AI_ENABLED: "true" },
      ai: { binding: "AI" },
    },
  },
};

test("production config loses env blocks but nothing else", () => {
  const { production } = splitEnvironments(generated);
  assert.equal("env" in production, false);
  assert.equal(production.name, "rega-cargo");
  assert.deepEqual(production.vars, generated.vars);
  assert.equal("ai" in production, false);
});

test("staging is flattened: own name/vars/bindings, inherited main/assets/compat", () => {
  const { environments } = splitEnvironments(generated);
  const staging = environments.staging;
  assert.equal(staging.name, "rega-cargo-staging");
  assert.deepEqual(staging.vars, { RL_AI_ENABLED: "true" });
  assert.deepEqual(staging.ai, { binding: "AI" });
  assert.equal(staging.main, "index.mjs");
  assert.deepEqual(staging.assets, generated.assets);
  assert.equal("env" in staging, false);
});

test("repo config: production has AI on with cap; staging is a separate worker with no routes", () => {
  const src = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");
  const json = JSON.parse(src.replace(/^\s*\/\/.*$/gm, ""));
  const { production, environments } = splitEnvironments(json);
  assert.equal(production.name, "rega-cargo");
  // Production lives only on its custom domain; staging keeps workers.dev.
  assert.equal(production.workers_dev, false);
  assert.equal(production.preview_urls, false);
  assert.deepEqual(production.routes, [{ pattern: "cargo.regaplatform.com", custom_domain: true }]);
  assert.equal(production.vars.SITE_URL, "https://cargo.regaplatform.com");
  assert.equal(production.vars.RL_AI_ENABLED, "true");
  assert.equal(production.vars.RL_AI_DAILY_CAP, "200");
  assert.deepEqual(production.ai, { binding: "AI" });
  assert.equal(production.durable_objects.bindings[0].class_name, "RlAiUsage");
  assert.equal(environments.staging.name, "rega-cargo-staging");
  assert.deepEqual(environments.staging.routes, []);
  assert.equal(environments.staging.workers_dev, true);
  assert.equal(environments.staging.preview_urls, true);
  assert.equal(environments.staging.vars.RL_AI_ENABLED, "true");
  assert.ok(!("hyperdrive" in environments.staging));
});
