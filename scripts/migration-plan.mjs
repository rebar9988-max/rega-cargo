// @ts-check
/**
 * Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
 * (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
 *
 * Applied files are keyed by BASENAME, so the same file applies once no matter
 * which directory it is globbed from. That is what makes the auth schema safe to
 * copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
 * a database that already has `0001_auth.sql` will not re-run it.
 *
 * Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
 * out of scope for both until it is copied up.
 */

/** The only branch whose builds may migrate the production database. */
export const PRODUCTION_BRANCH = "main";

/**
 * Whether `scripts/migrate.mjs` may touch DATABASE_URL in this environment.
 *
 * Workers Builds runs the same build command (`npm run build`, which ends in
 * `db:migrate`) for pull-request branches as for `main`, and its build
 * variables are not split by branch. A `DATABASE_URL` build variable would
 * therefore let unreviewed branch code migrate production. In any CI, only a
 * Workers Builds build of `main` may migrate; every other CI run (branch
 * builds, GitHub Actions, self-hosted runners) skips, even with a URL set.
 * Outside CI an operator running `npm run db:migrate` by hand is unaffected.
 * @param {Record<string, string | undefined>} env
 * @returns {{ run: boolean, reason: string }}
 */
export function migrationGate(env) {
  if (!env.DATABASE_URL) {
    return { run: false, reason: "DATABASE_URL not set" };
  }
  if (env.WORKERS_CI === "1") {
    return env.WORKERS_CI_BRANCH === PRODUCTION_BRANCH
      ? { run: true, reason: `Workers Builds production branch ${PRODUCTION_BRANCH}` }
      : {
          run: false,
          reason: `Workers Builds non-production branch "${env.WORKERS_CI_BRANCH ?? ""}"`,
        };
  }
  if (env.CI && env.CI !== "false" && env.CI !== "0") {
    return { run: false, reason: "CI outside Workers Builds never migrates" };
  }
  return { run: true, reason: "manual run outside CI" };
}

/**
 * The `_migrations` key for a migration path (or bare filename).
 * @param {string} path
 * @returns {string}
 */
export function migrationName(path) {
  return path.split("/").pop() ?? path;
}

/**
 * @param {string} path
 * @returns {boolean}
 */
export function isMigrationFile(path) {
  return path.endsWith(".sql");
}

/**
 * Migrations in `paths` that are not yet in `applied`, in apply order.
 * Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
 * @param {Iterable<string>} paths
 * @param {Iterable<string>} applied
 * @returns {Array<{ name: string, path: string }>}
 */
export function pendingMigrations(paths, applied) {
  const done = new Set(applied);
  return [...paths]
    .filter(isMigrationFile)
    .map((path) => ({ name: migrationName(path), path }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(({ name }) => !done.has(name));
}
