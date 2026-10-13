import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { prepareLayoutConfig } from "./layout-config.mjs";

const configUrl = new URL("../playwright.config.ts", import.meta.url).href;

test("Playwright workers loading the same config do not rewrite the watched layout config", () => {
  const cwd = mkdtempSync(join(tmpdir(), "rl-layout-import-"));
  mkdirSync(join(cwd, ".output/server"), { recursive: true });
  writeFileSync(
    join(cwd, ".output/server/wrangler.json"),
    JSON.stringify({
      name: "test-worker",
      hyperdrive: [{ binding: "HYPERDRIVE" }],
      vars: { RL_AI_ENABLED: "true" },
    }),
  );
  const env = { ...process.env };
  delete env.LAYOUT_BASE_URL;
  const run = spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      "--input-type=module",
      "-e",
      `
        import assert from 'node:assert/strict';
        import { readFileSync, statSync, utimesSync } from 'node:fs';
        const path = '.output/server/wrangler.layout.json';
        await import(${JSON.stringify(configUrl)});
        const expected = { name: 'test-worker', vars: { RL_AI_ENABLED: 'true' } };
        assert.deepEqual(JSON.parse(readFileSync(path, 'utf8')), expected);
        // Give the original a distinguishable timestamp, independent of filesystem precision.
        utimesSync(path, 1, 1);
        const before = statSync(path);
        await import(${JSON.stringify(`${configUrl}?another-worker`)});
        const after = statSync(path);
        assert.equal(after.mtimeMs, before.mtimeMs, 'identical config must not trigger Wrangler reloads');
        assert.equal(after.ino, before.ino, 'identical config must keep the existing file');
      `,
    ],
    { cwd, env, encoding: "utf8", timeout: 30_000 },
  );
  assert.equal(run.status, 0, `${run.error ?? ""}\n${run.stdout}\n${run.stderr}`);
});

test("layout config publishes complete JSON without changing other worker bindings", () => {
  const cwd = mkdtempSync(join(tmpdir(), "rl-layout-atomic-"));
  const built = join(cwd, "wrangler.json");
  const layout = join(cwd, "wrangler.layout.json");
  const old = '{"name":"old-worker"}\n';
  const expected = {
    name: "test-worker",
    ai: { binding: "AI" },
    durable_objects: { bindings: [] },
    vars: { RL_AI_DAILY_CAP: "200" },
  };
  writeFileSync(layout, old);
  writeFileSync(built, JSON.stringify({ ...expected, hyperdrive: [{ binding: "HYPERDRIVE" }] }));
  let publishes = 0;
  const rename = (staged, target) => {
    publishes++;
    assert.equal(
      readFileSync(target, "utf8"),
      old,
      "readers still see the previous complete config",
    );
    assert.deepEqual(JSON.parse(readFileSync(staged, "utf8")), expected);
    renameSync(staged, target);
  };
  assert.equal(prepareLayoutConfig(built, layout, { rename }), true);
  assert.equal(publishes, 1);
  assert.deepEqual(JSON.parse(readFileSync(layout, "utf8")), expected);
  assert.equal(prepareLayoutConfig(built, layout, { rename }), false);
  assert.equal(publishes, 1, "unchanged bytes are never republished");
  assert.deepEqual(readdirSync(cwd).sort(), ["wrangler.json", "wrangler.layout.json"]);
});

test("invalid input and a failed atomic publish preserve the last complete layout config", () => {
  const cwd = mkdtempSync(join(tmpdir(), "rl-layout-failure-"));
  const built = join(cwd, "wrangler.json");
  const layout = join(cwd, "wrangler.layout.json");
  const old = '{"name":"old-worker"}\n';
  writeFileSync(layout, old);
  writeFileSync(built, "{");
  assert.throws(() => prepareLayoutConfig(built, layout), SyntaxError);
  assert.equal(readFileSync(layout, "utf8"), old);
  writeFileSync(built, '{"name":"new-worker"}');
  const failure = Object.assign(new Error("simulated publish failure"), { code: "EACCES" });
  assert.throws(
    () =>
      prepareLayoutConfig(built, layout, {
        rename: () => {
          throw failure;
        },
      }),
    failure,
  );
  assert.equal(readFileSync(layout, "utf8"), old);
  assert.deepEqual(readdirSync(cwd).sort(), ["wrangler.json", "wrangler.layout.json"]);
});
