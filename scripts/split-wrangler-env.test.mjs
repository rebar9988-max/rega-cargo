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

test("bindings are not inherited by environments", () => {
  const { production, environments } = splitEnvironments({
    ...generated,
    hyperdrive: [{ binding: "HYPERDRIVE", id: "prod-db" }],
  });
  assert.deepEqual(production.hyperdrive, [{ binding: "HYPERDRIVE", id: "prod-db" }]);
  assert.ok(!("hyperdrive" in environments.staging));
  // Production vars are not leaked either; staging keeps only its own.
  assert.deepEqual(environments.staging.vars, { RL_AI_ENABLED: "true" });
});

test("repo config: production has AI on with cap; staging is a separate worker with no routes", () => {
  const src = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");
  const json = JSON.parse(src.replace(/^\s*\/\/.*$/gm, ""));
  const { production, environments } = splitEnvironments(json);
  assert.equal(production.name, "rega-cargo");
  // Production lives on its custom domain; staging keeps workers.dev.
  // workers.dev stays on only for the legacy-host 301 (scripts/legacy-host.mjs).
  assert.equal(production.workers_dev, true);
  assert.equal(production.preview_urls, false);
  // Primary www.rlgo.net; apex and the previous domain stay attached so their
  // redirects keep working. Never the REGA hosts (apex/www.regaplatform.com).
  assert.deepEqual(production.routes, [
    { pattern: "www.rlgo.net", custom_domain: true },
    { pattern: "rlgo.net", custom_domain: true },
    { pattern: "cargo.regaplatform.com", custom_domain: true },
  ]);
  assert.equal(production.vars.BETTER_AUTH_URL, "https://www.rlgo.net");
  assert.equal(production.vars.SITE_URL, "https://www.rlgo.net");
  assert.equal(typeof production.vars.RL_LEGACY_REDIRECT_HOSTS, "string");
  assert.equal(production.vars.RL_AI_ENABLED, "true");
  assert.equal(production.vars.RL_AI_DAILY_CAP, "200");
  assert.deepEqual(production.ai, { binding: "AI" });
  assert.equal(production.durable_objects.bindings[0].class_name, "RlAiUsage");
  assert.equal(environments.staging.name, "rega-cargo-staging");
  assert.deepEqual(environments.staging.routes, []);
  assert.equal(environments.staging.workers_dev, true);
  assert.equal(environments.staging.preview_urls, true);
  assert.equal(environments.staging.vars.RL_AI_ENABLED, "true");
  assert.deepEqual(production.hyperdrive, [
    { binding: "HYPERDRIVE", id: "795013d06b38408e87552686a6045291" },
  ]);
  assert.ok(!("hyperdrive" in environments.staging));
});

test("branch previews are explicit, non-indexed and have no production bindings or secrets", () => {
  const src = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");
  const config = JSON.parse(src.replace(/^\s*\/\/.*$/gm, ""));
  assert.deepEqual(Object.keys(config.previews), ["vars"]);
  assert.equal(config.previews.vars.RL_NOINDEX, "1");
  assert.equal(config.previews.vars.RL_AI_ENABLED, "false");
  assert.equal(config.previews.vars.RL_AI_DAILY_CAP, "0");
  assert.equal(config.previews.vars.PRODUCT_LINK_ENABLED, "false");
  assert.ok(!("DATABASE_URL" in config.previews.vars));
  assert.deepEqual(splitEnvironments(config).production.previews, config.previews);
  // The production service and binding remain the verified existing Cargo resources.
  assert.equal(config.name, "rega-cargo");
  assert.equal(config.hyperdrive[0].id, "795013d06b38408e87552686a6045291");
  assert.equal(config.vars.RL_AI_ENABLED, "true");
});
