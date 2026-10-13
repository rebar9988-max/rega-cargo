import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { handOver } from "./write-atomic.mjs";

/**
 * Each Playwright worker imports the config. Keep unchanged bytes in place so
 * Wrangler's config watcher does not reload the server during screenshots.
 * Publish changed bytes by rename, so readers never see a truncated JSON file.
 * @param {string} builtPath
 * @param {string} layoutPath
 * @param {{ rename?: typeof import("node:fs").renameSync }} [handOverOptions]
 */
export function prepareLayoutConfig(builtPath, layoutPath, handOverOptions = {}) {
  const { hyperdrive: _hyperdrive, ...config } = JSON.parse(readFileSync(builtPath, "utf8"));
  const content = `${JSON.stringify(config, null, 2)}\n`;
  try {
    if (readFileSync(layoutPath, "utf8") === content) return false;
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
  }

  // A unique sibling stays on the target filesystem even with concurrent imports.
  const staged = `${layoutPath}.${process.pid}.${randomUUID()}.tmp`;
  try {
    writeFileSync(staged, content, { flag: "wx" });
    handOver(staged, layoutPath, handOverOptions);
  } finally {
    if (existsSync(staged)) unlinkSync(staged);
  }
  return true;
}
