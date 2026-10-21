-- Bring For Me, Phase 1: order-by-link import, cart and automatic cost ESTIMATE.
-- Additive only: new tables, indexes, functions and triggers. No existing table, column, row,
-- constraint or trigger is altered or removed. No business number is seeded: every rate, fee and
-- threshold stays empty until a SUPER_ADMIN fills it in (the quote engine refuses to price while
-- a required setting is missing). The only seed rows are the small list of supported stores.
-- Nothing here creates an order, takes a payment or contacts a store.

-- ------------------------------------------------------------------ owner-editable settings
-- value NULL = "cleared / not filled in". Rows are never deleted. Every change is recorded by a
-- trigger in bfm_settings_history (who, when, old and new value), so the audit cannot be skipped.
create table if not exists bfm_settings (
  key text primary key check (key ~ '^[A-Za-z0-9_.]{1,80}$'),
  value jsonb check (value is null or jsonb_typeof(value) in ('number', 'string')),
  revision integer not null default 1 check (revision >= 1),
  updated_by text not null,
  updated_at timestamptz not null default now()
);
create table if not exists bfm_settings_history (
  id bigserial primary key,
  key text not null,
  old_value jsonb,
  new_value jsonb,
  revision integer not null,
  actor_id text not null,
  created_at timestamptz not null default now()
);
create index if not exists bfm_settings_history_key_idx on bfm_settings_history (key, id desc);

create or replace function bfm_settings_record() returns trigger language plpgsql as $$
begin
  insert into bfm_settings_history (key, old_value, new_value, revision, actor_id)
  values (NEW.key, case when TG_OP = 'UPDATE' then OLD.value end, NEW.value, NEW.revision, NEW.updated_by);
  return NEW;
end;
$$;
drop trigger if exists bfm_settings_audit on bfm_settings;
create trigger bfm_settings_audit after insert or update on bfm_settings
  for each row execute function bfm_settings_record();

create or replace function bfm_append_only() returns trigger language plpgsql as $$
begin raise exception 'Bring For Me records of this kind cannot be changed or deleted (%)', TG_TABLE_NAME; end;
$$;
drop trigger if exists bfm_settings_history_immutable on bfm_settings_history;
create trigger bfm_settings_history_immutable before update or delete on bfm_settings_history
  for each row execute function bfm_append_only();
drop trigger if exists bfm_settings_no_delete on bfm_settings;
create trigger bfm_settings_no_delete before delete on bfm_settings
  for each row execute function bfm_append_only();

-- ------------------------------------------------------------------ generic audit log
create table if not exists bfm_audit_log (
  id bigserial primary key,
  actor_id text not null,
  action text not null,
  resource text not null,
  resource_id text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists bfm_audit_resource_idx on bfm_audit_log (resource, resource_id, id desc);
drop trigger if exists bfm_audit_log_immutable on bfm_audit_log;
create trigger bfm_audit_log_immutable before update or delete on bfm_audit_log
  for each row execute function bfm_append_only();

-- ------------------------------------------------------------------ supported stores
create table if not exists bfm_stores (
  key text primary key check (key ~ '^[a-z0-9_]{2,40}$'),
  name text not null,
  domains text[] not null check (cardinality(domains) >= 1),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
insert into bfm_stores (key, name, domains) values
  ('amazon', 'Amazon', array['amazon.de','amazon.com','amazon.co.uk','amazon.fr','amazon.it','amazon.es','amazon.nl','amazon.pl','amazon.se','amazon.com.tr']),
  ('trendyol', 'Trendyol', array['trendyol.com']),
  ('zara', 'Zara', array['zara.com']),
  ('hm', 'H&M', array['hm.com']),
  ('shein', 'Shein', array['shein.com','shein.de','shein.co.uk','shein.fr']),
  ('adidas', 'Adidas', array['adidas.com','adidas.de','adidas.co.uk','adidas.fr','adidas.com.tr'])
on conflict (key) do nothing;

-- ------------------------------------------------------------------ coupons (owner managed)
create table if not exists bfm_coupons (
  code text primary key check (code ~ '^[A-Z0-9_-]{3,32}$'),
  kind text not null check (kind in ('fixed_iqd', 'percent_bp')),
  value integer not null check (value > 0),
  max_discount_iqd integer check (max_discount_iqd is null or max_discount_iqd > 0),
  min_items_iqd integer check (min_items_iqd is null or min_items_iqd > 0),
  starts_at timestamptz,
  expires_at timestamptz not null,
  active boolean not null default true,
  created_by text not null,
  created_at timestamptz not null default now(),
  check (kind <> 'percent_bp' or value <= 10000),
  check (starts_at is null or starts_at < expires_at)
);

-- ------------------------------------------------------------------ import cache (10 minutes)
-- Only the PUBLIC metadata of a page that passed the prohibited-product screening is cached.
-- Rejected links are cached as a bare outcome (no title, no image). Rows are overwritten, never
-- deleted by the app.
create table if not exists bfm_import_cache (
  url_hash text primary key check (url_hash ~ '^[0-9a-f]{64}$'),
  host text not null,
  outcome text not null check (outcome in ('ok', 'needs_manual', 'rejected', 'needs_review')),
  data jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now()
);

-- ------------------------------------------------------------------ carts
create table if not exists bfm_carts (
  id text primary key,
  user_id text not null unique,
  governorate text check (governorate is null or governorate ~ '^[a-z_]{3,24}$'),
  coupon_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bfm_cart_items (
  id text primary key,
  cart_id text not null references bfm_carts (id),
  store_key text not null check (store_key ~ '^[a-z0-9_.-]{2,80}$'),
  store_name text not null check (char_length(store_name) between 1 and 80),
  store_known boolean not null default false,
  source_url text not null check (char_length(source_url) <= 2000),
  source_host text not null,
  title text not null check (char_length(title) between 1 and 300),
  image_url text check (image_url is null or char_length(image_url) <= 2000),
  price_minor bigint not null check (price_minor > 0 and price_minor <= 1000000000),
  currency text not null check (currency in ('USD', 'EUR', 'TRY', 'GBP')),
  quantity integer not null check (quantity between 1 and 20),
  options text check (options is null or char_length(options) <= 200),
  category text not null check (category in ('beauty','fashion','electronics','home','baby','sports','food','gaming','auto','pets','general')),
  weight_g integer check (weight_g is null or weight_g between 1 and 70000),
  length_mm integer check (length_mm is null or length_mm between 1 and 2000),
  width_mm integer check (width_mm is null or width_mm between 1 and 2000),
  height_mm integer check (height_mm is null or height_mm between 1 and 2000),
  -- Provenance: where the price came from, when it was read, and that the customer confirmed it.
  origin text not null check (origin in ('imported', 'imported_edited', 'manual')),
  price_source text not null check (price_source in ('jsonld', 'opengraph', 'microdata', 'manual')),
  retrieved_at timestamptz,
  confirmed_at timestamptz not null,
  -- Prohibited-product screening. 'needs_review' cannot be quoted until the owner approves.
  screening text not null check (screening in ('clear', 'needs_review', 'owner_approved')),
  review_reason text check (review_reason is null or char_length(review_reason) <= 120),
  reviewed_by text,
  reviewed_at timestamptz,
  removed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bfm_cart_items_cart_idx on bfm_cart_items (cart_id) where removed_at is null;
create index if not exists bfm_cart_items_review_idx on bfm_cart_items (created_at desc) where screening = 'needs_review' and removed_at is null;

-- ------------------------------------------------------------------ quotes (immutable snapshots)
create table if not exists bfm_quotes (
  id text primary key,
  user_id text not null,
  cart_id text not null references bfm_carts (id),
  version integer not null check (version >= 1),
  input_hash text not null check (input_hash ~ '^[0-9a-f]{64}$'),
  engine_version integer not null,
  governorate text not null,
  zone text not null,
  items_iqd bigint not null,
  customs_iqd bigint not null,
  freight_iqd bigint not null,
  rl_fee_iqd bigint not null,
  home_delivery_iqd bigint not null,
  coupon_iqd bigint not null,
  raw_total_iqd bigint not null,
  total_iqd bigint not null check (total_iqd >= 0),
  coupon_code text,
  quote jsonb not null,
  settings_snapshot jsonb not null,
  items_snapshot jsonb not null,
  expires_at timestamptz not null,
  -- Always an estimate until R&L reviews it. Phase 1 creates no order and takes no payment.
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (cart_id, version)
);
create index if not exists bfm_quotes_user_idx on bfm_quotes (user_id, created_at desc);
create index if not exists bfm_quotes_dedupe_idx on bfm_quotes (cart_id, input_hash, id desc);

-- Only the approval columns may change, and only once, from 'pending'.
create or replace function bfm_quote_guard() returns trigger language plpgsql as $$
begin
  if TG_OP = 'DELETE' then raise exception 'Bring For Me quotes cannot be deleted'; end if;
  if (to_jsonb(NEW) - 'approval_status' - 'approved_by' - 'approved_at')
     is distinct from (to_jsonb(OLD) - 'approval_status' - 'approved_by' - 'approved_at') then
    raise exception 'A Bring For Me quote snapshot cannot be changed';
  end if;
  if OLD.approval_status <> 'pending' and NEW.approval_status is distinct from OLD.approval_status then
    raise exception 'A reviewed Bring For Me quote cannot be reviewed again';
  end if;
  return NEW;
end;
$$;
drop trigger if exists bfm_quotes_guard on bfm_quotes;
create trigger bfm_quotes_guard before update or delete on bfm_quotes
  for each row execute function bfm_quote_guard();
