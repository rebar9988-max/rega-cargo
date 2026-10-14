import assert from "node:assert/strict";
import { test } from "node:test";
import { hasApprovedRole, isSuperAdmin } from "./authority.ts";
test("only an approved database SUPER_ADMIN has the full role hierarchy", () => {
  for (const role of ["buyer", "seller", "courier", "admin", "super_admin"]) assert.equal(hasApprovedRole([{ role: "super_admin", status: "approved" }], role), true);
  for (const status of ["pending", "removed"]) { assert.equal(isSuperAdmin([{ role: "super_admin", status }]), false); assert.equal(hasApprovedRole([{ role: "super_admin", status }], "admin"), false); }
  assert.equal(isSuperAdmin([{ role: "admin", status: "approved" }]), false);
  assert.equal(isSuperAdmin([{ role: "SUPER_ADMIN", status: "approved" }]), false);
  assert.equal(hasApprovedRole([{ role: "admin", status: "approved" }], "seller"), false);
});
