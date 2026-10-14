import { readFileSync } from "node:fs";
import { releaseReadiness } from "../src/lib/business-profile.ts";

const raw = JSON.parse(
  readFileSync(new URL("../src/lib/business-approved.json", import.meta.url), "utf8"),
);
const policy = JSON.parse(
  readFileSync(new URL("../src/lib/release-policy.json", import.meta.url), "utf8"),
);
const readiness = releaseReadiness(raw, policy);
if (!readiness.allowed) {
  console.error("Release blocked: verified owner-supplied legal/business information is missing:");
  console.error(readiness.missing.join(", "));
  if (!readiness.stage) console.error("A valid beta/public release stage is required.");
  process.exitCode = 1;
} else if (!readiness.ready) {
  console.warn(
    "Owner-authorized beta release: legal/business information remains incomplete and unverified.",
  );
  console.warn(
    "Complete verified information before switching release-policy.json to the public stage.",
  );
  console.warn(readiness.missing.join(", "));
} else {
  console.info(
    "Legal/business presence check passed. Owner verification source is recorded; this is not automated legal certification.",
  );
}
