-- Delivery and transport. Same user_id as the marketplace roles.

create table if not exists delivery_requests (
  id text primary key,
  user_id text not null,
  product_slug text,
  pickup text not null,
  dropoff text not null,
  item_desc text not null,
  size_note text not null default '',
  preferred_date text not null default '',
  status text not null default 'requested' check (status in ('requested', 'accepted', 'picked_up', 'on_the_way', 'delivered', 'cancelled')),
  courier_id text,
  created_at timestamptz not null default now()
);

create index if not exists delivery_status_idx on delivery_requests (status, created_at desc);

create table if not exists transport_requests (
  id text primary key,
  user_id text not null,
  origin text not null,
  destination text not null,
  load_desc text not null,
  preferred_date text not null default '',
  status text not null default 'requested' check (status in ('requested', 'accepted', 'picked_up', 'on_the_way', 'delivered', 'cancelled')),
  courier_id text,
  created_at timestamptz not null default now()
);

create index if not exists transport_status_idx on transport_requests (status, created_at desc);

create table if not exists job_status (
  id text primary key,
  job_kind text not null check (job_kind in ('delivery', 'transport')),
  job_id text not null,
  status text not null,
  actor_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists job_status_job_idx on job_status (job_kind, job_id, created_at);

create table if not exists job_offers (
  id text primary key,
  job_kind text not null check (job_kind in ('delivery', 'transport')),
  job_id text not null,
  courier_id text not null,
  note text not null default '',
  status text not null default 'offered' check (status in ('offered', 'chosen', 'declined')),
  created_at timestamptz not null default now(),
  unique (job_kind, job_id, courier_id)
);
