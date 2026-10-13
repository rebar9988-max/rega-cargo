import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { CI_NODE_MAJOR, OFFICIAL_IMAGE, planSteps, safeEnv, verdict } from "./quality-local.mjs";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const workflow = read(".github/workflows/quality.yml");
const pkg = JSON.parse(read("package.json"));
const ids = (steps) => steps.map((s) => s.id);

test("the local gate runs every step of the CI verify job", () => {
  const steps = planSteps({ layout: "official", audit: true });
  for (const [ci, script, id] of [
    ["npm run typecheck", "typecheck", "typecheck"],
    ["npm test", "test", "test"],
    ["npm run lint", "lint", "lint"],
    ["npm run build", "build", "build"],
    ["npm run cf:dry-run", "cf:dry-run", "cf-dry-run"],
  ]) {
    assert.ok(workflow.includes(`run: ${ci}\n`), `CI verify no longer runs "${ci}"`);
    const step = steps.find((s) => s.id === id);
    assert.ok(step, `local gate is missing ${id}`);
    assert.deepEqual(step.args, ["run", "-s", script]);
    assert.ok(pkg.scripts[script], `package.json has no ${script} script`);
  }
  assert.deepEqual(ids(steps).slice(-1), ["layout"], "layout lock runs last, after the build");
});

test("the official image matches CI and the pinned Playwright version", () => {
  assert.ok(workflow.includes(`image: ${OFFICIAL_IMAGE}`), "quality.yml uses a different image");
  assert.ok(
    pkg.scripts["test:layout:update"].includes(OFFICIAL_IMAGE),
    "baseline update uses another image",
  );
  assert.equal(
    OFFICIAL_IMAGE,
    `mcr.microsoft.com/playwright:v${pkg.devDependencies["@playwright/test"]}-noble`,
  );
  assert.ok(workflow.includes(`node-version: '${CI_NODE_MAJOR}'`), "CI Node version changed");
});

test("the official-image layout step runs the full suite and leaves host node_modules alone", () => {
  const layout = planSteps({ layout: "official", audit: true }).find((s) => s.id === "layout");
  const shell = layout.args.at(-1);
  assert.match(
    shell,
    /npx playwright test$/,
    "screenshots must be compared, never updated or ignored",
  );
  assert.doesNotMatch(shell, /update-snapshots|ignore-snapshots/);
  assert.ok(
    layout.args.includes("/work/node_modules"),
    "container must install into its own volume",
  );
  assert.ok(layout.args.includes("DATABASE_URL="));
});

test("without Docker the layout step is geometry-only and marked partial", () => {
  const steps = planSteps({ layout: "geometry", audit: true });
  const geo = steps.find((s) => s.group === "layout");
  assert.equal(geo.partial, true);
  assert.ok(geo.args.includes("--ignore-snapshots"));
  assert.ok(
    !ids(planSteps({ layout: "none", audit: false })).some((id) => id.startsWith("layout")),
  );
  assert.ok(!ids(planSteps({ layout: "none", audit: false })).includes("audit"));
});

test("every step runs with an empty DATABASE_URL", () => {
  const env = safeEnv({ DATABASE_URL: "postgres://example.invalid/db", PATH: "/bin" });
  assert.equal(env.DATABASE_URL, "");
  assert.equal(env.PATH, "/bin");
});

test("only a full run in CI parity is a pass", () => {
  const ok = [{ id: "typecheck", status: "pass" }];
  const full = { layout: "official", audit: true, nodeMajor: CI_NODE_MAJOR };
  assert.deepEqual(verdict(ok, full), { status: "pass", exitCode: 0, failed: [], gaps: [] });

  const geo = verdict(ok, { ...full, layout: "geometry" });
  assert.equal(geo.status, "partial");
  assert.equal(geo.exitCode, 2);
  assert.match(geo.gaps[0], /screenshots and WebKit not checked/);

  assert.equal(verdict(ok, { ...full, audit: false }).status, "partial");
  assert.equal(verdict(ok, { ...full, nodeMajor: 24 }).status, "partial");

  const bad = verdict([...ok, { id: "lint", status: "fail" }], { ...full, layout: "geometry" });
  assert.equal(bad.status, "fail");
  assert.equal(bad.exitCode, 1);
  assert.deepEqual(bad.failed, ["lint"]);
});
