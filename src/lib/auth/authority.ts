export type RoleRow = { role: string; status: string };
export function hasApprovedRole(rows: readonly RoleRow[], role: string) {
  return rows.some(row => row.status === "approved" && (row.role === role || row.role === "super_admin"));
}
export function isSuperAdmin(rows: readonly RoleRow[]) {
  return rows.some(row => row.role === "super_admin" && row.status === "approved");
}
