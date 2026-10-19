import { test } from "node:test";
import assert from "node:assert/strict";
import { ownerAuthRequestAllowed } from "./http.ts";
const request = (
  path: string,
  method = "POST",
  headers: Record<string, string> = { origin: "https://www.rlgo.net" },
) => new Request(`https://www.rlgo.net/api/auth/${path}`, { method, headers });
test("public signup, verification and privilege/account linking endpoints are closed", () => {
  for (const path of [
    "sign-up/email",
    "verify-email",
    "send-verification-email",
    "change-email",
    "link-social",
    "admin/set-role",
    "delete-user",
    "request-password-reset",
  ]) {
    assert.equal(ownerAuthRequestAllowed(request(path)), false);
    assert.equal(ownerAuthRequestAllowed(request(path, "GET")), false);
  }
});
test("auth mutations reject absent origin, sibling and external origin/fetch metadata", () => {
  const attacks: Record<string, string>[] = [
    {},
    { origin: "https://rlgo.net" },
    { origin: "https://attacker.test" },
    { origin: "https://www.rlgo.net", "sec-fetch-site": "same-site" },
  ];
  for (const headers of attacks)
    assert.equal(ownerAuthRequestAllowed(request("sign-in/email", "POST", headers)), false);
  assert.equal(ownerAuthRequestAllowed(request("sign-in/email")), true);
  assert.equal(ownerAuthRequestAllowed(request("sign-out")), true);
  assert.equal(ownerAuthRequestAllowed(request("change-password")), true);
});
test("session reads reject sibling scripted requests and unsupported methods", () => {
  assert.equal(ownerAuthRequestAllowed(request("get-session", "GET", {})), true);
  assert.equal(
    ownerAuthRequestAllowed(request("get-session", "GET", { "sec-fetch-site": "cross-site" })),
    false,
  );
  assert.equal(ownerAuthRequestAllowed(request("get-session", "DELETE")), false);
});
