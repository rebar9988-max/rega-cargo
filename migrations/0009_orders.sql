-- Real quote / store-purchase requests and shipment tracking.
-- Prices stored here are estimates, not charges.

create table if not exists shipment_requests (
  id text primary key,
  user_id text not null,
  kind text not null check (kind in ('quote', 'store')),
  name text not null,
  phone text not null,
  payload text not null,
  estimate_eur integer,
  status text not null default 'received' check (status in ('received', 'confirmed', 'in_transit', 'delivered', 'cancelled')),
  tracking_id text unique,
  created_at timestamptz not null default now()
);

create index if not exists shipment_requests_user_idx on shipment_requests (user_id, created_at desc);
create index if not exists shipment_requests_status_idx on shipment_requests (status, created_at desc);

create table if not exists tracking_events (
  id text primary key,
  shipment_id text not null references shipment_requests (id),
  title text not null,
  title_ku text not null,
  place text not null default '',
  place_ku text not null default '',
  phase text not null check (phase in ('done', 'now', 'next')),
  created_at timestamptz not null default now()
);

create index if not exists tracking_events_shipment_idx on tracking_events (shipment_id, created_at);
