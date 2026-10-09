-- Customer requests: "buy for me" and "ship what I bought", staff quotes the
-- customer must accept, and a recorded status history. Backward-compatible only:
-- check constraints are widened (every existing value stays valid), new columns
-- are nullable or defaulted, and new tables are added. Nothing is dropped or rewritten.

alter table shipment_requests drop constraint if exists shipment_requests_kind_check;
alter table shipment_requests add constraint shipment_requests_kind_check
  check (kind in ('quote', 'store', 'buy', 'forward'));

alter table shipment_requests drop constraint if exists shipment_requests_status_check;
alter table shipment_requests add constraint shipment_requests_status_check
  check (status in ('received', 'reviewing', 'quoted', 'accepted', 'confirmed', 'purchased', 'in_transit', 'arrived', 'delivered', 'cancelled'));

-- Client-generated key per form submission; the same key never creates a second request.
alter table shipment_requests add column if not exists idempotency_key text;
alter table shipment_requests add column if not exists updated_at timestamptz not null default now();
create unique index if not exists shipment_requests_idem_idx
  on shipment_requests (user_id, idempotency_key) where idempotency_key is not null;

alter table declarations drop constraint if exists declarations_kind_check;
alter table declarations add constraint declarations_kind_check
  check (kind in ('quote', 'delivery', 'transport', 'store', 'buy', 'forward'));

-- A confirmed price from staff. Separate from shipment_requests.estimate_eur (an estimate only).
create table if not exists request_quotes (
  id text primary key,
  request_id text not null references shipment_requests (id),
  amount_iqd integer not null check (amount_iqd > 0),
  customs_included boolean not null,
  note text not null default '',
  valid_until timestamptz not null,
  status text not null default 'sent' check (status in ('sent', 'accepted', 'declined', 'superseded')),
  created_by text not null,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create index if not exists request_quotes_request_idx on request_quotes (request_id, created_at desc);
create unique index if not exists request_quotes_one_accepted on request_quotes (request_id) where status = 'accepted';

-- Every status change as it happened (who: customer, staff or system).
create table if not exists request_status_log (
  id text primary key,
  request_id text not null references shipment_requests (id),
  status text not null,
  actor text not null check (actor in ('customer', 'staff', 'system')),
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists request_status_log_request_idx on request_status_log (request_id, created_at);
