-- Phone sign-in: send time, atomic counters. Safe on an empty database.

alter table phone_codes add column if not exists sent_at timestamptz not null default now();

create table if not exists rate_counters (
  key text primary key,
  n integer not null,
  window_start timestamptz not null,
  allowed boolean not null default true
);
