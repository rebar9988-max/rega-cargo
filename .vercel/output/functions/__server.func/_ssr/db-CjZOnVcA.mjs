//#region node_modules/.nitro/vite/services/ssr/assets/db-CjZOnVcA.js
var _0002_market_default = "-- Marketplace tables. user_id matches Better Auth \"user\".id (text).\n-- No foreign key: the auth schema is optional and is not applied when sign-in is off.\n\ncreate table if not exists user_roles (\n  user_id text not null,\n  role text not null check (role in ('buyer', 'seller', 'courier', 'admin')),\n  status text not null default 'pending' check (status in ('pending', 'approved', 'removed')),\n  display_name text,\n  city text,\n  phone text,\n  created_at timestamptz not null default now(),\n  primary key (user_id, role)\n);\n\ncreate table if not exists categories (\n  id text primary key,\n  name_ku text not null,\n  name_en text not null\n);\n\ncreate table if not exists products (\n  id text primary key,\n  slug text not null unique,\n  owner_id text not null,\n  category_id text not null references categories (id),\n  name_ku text not null,\n  name_en text not null,\n  description_ku text not null default '',\n  brand text not null,\n  specs text not null default '',\n  image text,\n  status text not null default 'pending' check (status in ('pending', 'approved', 'removed')),\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists products_list_idx on products (status, created_at desc);\n\ncreate table if not exists offers (\n  id text primary key,\n  product_id text not null references products (id),\n  seller_id text not null,\n  price_iqd integer not null check (price_iqd >= 0 and price_iqd <= 50000000),\n  shipping_iqd integer not null default 0 check (shipping_iqd >= 0 and shipping_iqd <= 5000000),\n  stock text not null check (stock in ('in', 'low', 'out')),\n  contact text not null,\n  status text not null default 'pending' check (status in ('pending', 'approved', 'removed', 'hidden')),\n  created_at timestamptz not null default now(),\n  updated_at timestamptz not null default now(),\n  unique (product_id, seller_id)\n);\n\ncreate index if not exists offers_product_idx on offers (product_id, status);\n\ncreate table if not exists price_history (\n  id text primary key,\n  offer_id text not null references offers (id),\n  price_iqd integer not null,\n  shipping_iqd integer not null,\n  recorded_at timestamptz not null default now()\n);\n\ncreate index if not exists price_history_offer_idx on price_history (offer_id, recorded_at);\n\ncreate table if not exists favorites (\n  user_id text not null,\n  product_id text not null references products (id),\n  created_at timestamptz not null default now(),\n  primary key (user_id, product_id)\n);\n\ncreate table if not exists price_alerts (\n  id text primary key,\n  user_id text not null,\n  product_id text not null references products (id),\n  target_iqd integer not null check (target_iqd > 0),\n  created_at timestamptz not null default now(),\n  unique (user_id, product_id)\n);\n\ncreate table if not exists reviews (\n  id text primary key,\n  user_id text not null,\n  product_id text references products (id),\n  job_kind text,\n  job_id text,\n  target_user_id text,\n  rating integer not null check (rating between 1 and 5),\n  body text not null default '',\n  created_at timestamptz not null default now()\n);\n\ncreate unique index if not exists reviews_product_user_idx\n  on reviews (user_id, product_id) where product_id is not null;\n\ncreate unique index if not exists reviews_job_user_idx\n  on reviews (user_id, job_kind, job_id) where job_id is not null;\n\ncreate table if not exists reports (\n  id text primary key,\n  user_id text not null,\n  subject text not null,\n  body text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists notifications (\n  id text primary key,\n  user_id text not null,\n  body_ku text not null,\n  body_en text not null,\n  read_at timestamptz,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists notifications_user_idx on notifications (user_id, created_at desc);\n\ncreate table if not exists action_log (\n  id text primary key,\n  user_id text not null,\n  action text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists action_log_user_idx on action_log (user_id, action, created_at);\n\ninsert into categories (id, name_ku, name_en) values\n  ('beauty', 'جوانکاری', 'Beauty'),\n  ('fashion', 'جلوبەرگ', 'Fashion'),\n  ('electronics', 'ئەلیکترۆنی', 'Electronics'),\n  ('home', 'ماڵ', 'Home'),\n  ('baby', 'منداڵ', 'Baby'),\n  ('sports', 'وەرزش', 'Sports')\non conflict (id) do nothing;\n\ninsert into user_roles (user_id, role, status, display_name, city) values\n  ('dev-user', 'buyer', 'approved', 'Dev', 'هەولێر'),\n  ('dev-user', 'seller', 'approved', 'فرۆشگای هەولێر', 'هەولێر'),\n  ('dev-user', 'courier', 'approved', 'شۆفێری هەولێر', 'هەولێر'),\n  ('dev-user', 'admin', 'approved', 'بەڕێوەبەر', 'هەولێر'),\n  ('seed-slemani', 'seller', 'approved', 'بازاڕی سلێمانی', 'سلێمانی'),\n  ('seed-duhok', 'seller', 'approved', 'دوکانی دهۆک', 'دهۆک'),\n  ('seed-kirkuk', 'seller', 'pending', 'فرۆشیاری کەرکووک', 'کەرکووک'),\n  ('seed-driver', 'courier', 'approved', 'شۆفێری سلێمانی', 'سلێمانی')\non conflict (user_id, role) do nothing;\n\ninsert into products (id, slug, owner_id, category_id, name_ku, name_en, description_ku, brand, specs, image, status) values\n  ('earbuds', 'earbuds', 'seed-slemani', 'electronics', 'بیستۆکی بێوایەر', 'Wireless earbuds', 'بیستۆکی بچووک بۆ ڕۆژانە. نموونەی بەراوردە، کڕین لەلای فرۆشیارە.', 'Hêlîn', 'بێ وایەر', '/bazaar/earbuds.jpg', 'approved'),\n  ('kettle', 'kettle', 'dev-user', 'home', 'کەتڵی کارەبایی', 'Electric kettle', 'کەتڵی سادە بۆ چای. نرخەکان بۆ بەراوردن.', 'Roj', '١.٧ لیتر', '/bazaar/kettle.jpg', 'approved'),\n  ('cream', 'cream', 'seed-duhok', 'beauty', 'کرێمی دەموچاو', 'Face cream', 'کرێمی ڕۆژانە. شلە ڕەنگە لە گواستنەوەی ئاسمانی سنووردار بێت.', 'Şane', '٥٠ مل', '/bazaar/cream.jpg', 'approved'),\n  ('sneakers', 'sneakers', 'seed-slemani', 'fashion', 'پێڵاوی وەرزشی', 'Sneakers', 'پێڵاوی سپی. قەبارە لەلای فرۆشیار پشتڕاست دەکرێتەوە.', 'Nwe', 'قەبارە ٣٦–٤٤', '/bazaar/sneakers.jpg', 'approved'),\n  ('perfume', 'perfume', 'dev-user', 'beauty', 'عەتر', 'Perfume', 'بۆن. ڕەنگە باری ئاسمانی وەری نەگرێت.', 'Dilan', '٥٠ مل', '/bazaar/perfume.jpg', 'approved'),\n  ('ball', 'ball', 'seed-duhok', 'sports', 'تۆپی تۆپ', 'Football', 'تۆپی ڕاهێنان.', 'Roj', 'قەبارە ٥', '/bazaar/ball.jpg', 'approved'),\n  ('baby', 'baby', 'seed-slemani', 'baby', 'جلی منداڵ', 'Baby clothes', 'جلی نەرمی منداڵ.', 'Hêlîn', '٠–١٢ مانگ', '/bazaar/baby.jpg', 'approved'),\n  ('dress', 'dress', 'seed-kirkuk', 'fashion', 'جلی ڕۆژانە', 'Everyday dress', 'چاوەڕوانی پەسەندی بەڕێوەبەرە.', 'Nwe', 'قەبارە S–L', '/bazaar/dress.jpg', 'pending')\non conflict (id) do nothing;\n\ninsert into offers (id, product_id, seller_id, price_iqd, shipping_iqd, stock, contact, status) values\n  ('o1', 'earbuds', 'dev-user', 45000, 0, 'in', 'https://example.com/erbil/earbuds', 'approved'),\n  ('o2', 'earbuds', 'seed-slemani', 47000, 2000, 'in', 'https://example.com/slemani/earbuds', 'approved'),\n  ('o3', 'earbuds', 'seed-duhok', 44000, 4000, 'low', 'https://example.com/duhok/earbuds', 'approved'),\n  ('o4', 'kettle', 'dev-user', 32000, 0, 'in', 'https://example.com/erbil/kettle', 'approved'),\n  ('o5', 'kettle', 'seed-slemani', 30000, 3000, 'in', 'https://example.com/slemani/kettle', 'approved'),\n  ('o6', 'kettle', 'seed-duhok', 35000, 0, 'out', 'https://example.com/duhok/kettle', 'approved'),\n  ('o7', 'cream', 'seed-slemani', 18000, 0, 'in', 'https://example.com/slemani/cream', 'approved'),\n  ('o8', 'cream', 'dev-user', 17500, 1500, 'in', 'https://example.com/erbil/cream', 'approved'),\n  ('o9', 'sneakers', 'seed-duhok', 65000, 0, 'in', 'https://example.com/duhok/sneakers', 'approved'),\n  ('o10', 'sneakers', 'dev-user', 69000, 0, 'in', 'https://example.com/erbil/sneakers', 'approved'),\n  ('o11', 'sneakers', 'seed-slemani', 64000, 2500, 'in', 'https://example.com/slemani/sneakers', 'approved'),\n  ('o12', 'perfume', 'dev-user', 54000, 0, 'in', 'https://example.com/erbil/perfume', 'approved'),\n  ('o13', 'perfume', 'seed-slemani', 51000, 2000, 'low', 'https://example.com/slemani/perfume', 'approved'),\n  ('o14', 'ball', 'seed-slemani', 15000, 0, 'in', 'https://example.com/slemani/ball', 'approved'),\n  ('o15', 'ball', 'dev-user', 16000, 1000, 'in', 'https://example.com/erbil/ball', 'approved'),\n  ('o16', 'ball', 'seed-duhok', 14500, 2000, 'in', 'https://example.com/duhok/ball', 'approved'),\n  ('o17', 'baby', 'dev-user', 28000, 0, 'in', 'https://example.com/erbil/baby', 'approved'),\n  ('o18', 'baby', 'seed-slemani', 27000, 2000, 'low', 'https://example.com/slemani/baby', 'approved')\non conflict (id) do nothing;\n\ninsert into price_history (id, offer_id, price_iqd, shipping_iqd, recorded_at) values\n  ('h1', 'o1', 52000, 0, now() - interval '40 days'),\n  ('h2', 'o1', 48000, 0, now() - interval '12 days'),\n  ('h3', 'o1', 45000, 0, now() - interval '1 day'),\n  ('h4', 'o5', 36000, 3000, now() - interval '30 days'),\n  ('h5', 'o5', 30000, 3000, now() - interval '2 days'),\n  ('h6', 'o11', 70000, 2500, now() - interval '20 days'),\n  ('h7', 'o11', 64000, 2500, now() - interval '3 days')\non conflict (id) do nothing;\n";
var _0003_delivery_default = "-- Delivery and transport. Same user_id as the marketplace roles.\n\ncreate table if not exists delivery_requests (\n  id text primary key,\n  user_id text not null,\n  product_slug text,\n  pickup text not null,\n  dropoff text not null,\n  item_desc text not null,\n  size_note text not null default '',\n  preferred_date text not null default '',\n  status text not null default 'requested' check (status in ('requested', 'accepted', 'picked_up', 'on_the_way', 'delivered', 'cancelled')),\n  courier_id text,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists delivery_status_idx on delivery_requests (status, created_at desc);\n\ncreate table if not exists transport_requests (\n  id text primary key,\n  user_id text not null,\n  origin text not null,\n  destination text not null,\n  load_desc text not null,\n  preferred_date text not null default '',\n  status text not null default 'requested' check (status in ('requested', 'accepted', 'picked_up', 'on_the_way', 'delivered', 'cancelled')),\n  courier_id text,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists transport_status_idx on transport_requests (status, created_at desc);\n\ncreate table if not exists job_status (\n  id text primary key,\n  job_kind text not null check (job_kind in ('delivery', 'transport')),\n  job_id text not null,\n  status text not null,\n  actor_id text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists job_status_job_idx on job_status (job_kind, job_id, created_at);\n\ncreate table if not exists job_offers (\n  id text primary key,\n  job_kind text not null check (job_kind in ('delivery', 'transport')),\n  job_id text not null,\n  courier_id text not null,\n  note text not null default '',\n  status text not null default 'offered' check (status in ('offered', 'chosen', 'declined')),\n  created_at timestamptz not null default now(),\n  unique (job_kind, job_id, courier_id)\n);\n";
var _0004_phone_default = "create table if not exists phone_users (\n  id text primary key,\n  phone text not null unique,\n  name text not null,\n  pin_hash text not null,\n  pin_salt text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists phone_sessions (\n  token_hash text primary key,\n  user_id text not null,\n  expires_at timestamptz not null,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists phone_sessions_user_idx on phone_sessions (user_id);\n";
var _0005_phone_codes_default = "create table if not exists phone_codes (\n  phone text primary key,\n  code_hash text not null,\n  code_salt text not null,\n  expires_at timestamptz not null,\n  attempts integer not null default 0\n);\n";
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
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.n);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0002_market.sql": _0002_market_default,
			"/migrations/0003_delivery.sql": _0003_delivery_default,
			"/migrations/0004_phone.sql": _0004_phone_default,
			"/migrations/0005_phone_codes.sql": _0005_phone_codes_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* The shared PGLite instance (preview only), with `migrations/*.sql` applied.
* Lets Better Auth persist to the SAME embedded DB as app data in preview (via a
* Kysely dialect). Throws when `DATABASE_URL` is set (that path uses Neon).
*/
async function getPglite() {
	if (dbSource !== "pglite") throw new Error("getPglite() is only available on the PGLite fallback (no DATABASE_URL)");
	await getSql();
	const pg = await globalRef.__pgliteInstance__;
	if (!pg) throw new Error("PGLite instance failed to initialize");
	return pg;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
//#endregion
export { getPglite as n, getSql as r, ensureDbReady as t };
