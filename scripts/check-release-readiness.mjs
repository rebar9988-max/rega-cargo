import { readFileSync } from "node:fs";
import { businessReadiness } from "../src/lib/business-profile.ts";

const raw = JSON.parse(readFileSync(new URL("../src/lib/business-approved.json", import.meta.url), "utf8"));
const readiness = businessReadiness(raw);
if (!readiness.ready) {
  console.error("Release blocked: verified owner-supplied legal/business information is missing:");
  console.error(readiness.missing.join(", "));
  process.exitCode = 1;
} else {
  console.info("Legal/business presence check passed. Owner verification source is recorded; this is not automated legal certification.");
}
