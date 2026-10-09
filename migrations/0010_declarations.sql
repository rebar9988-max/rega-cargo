-- Restricted-items declarations accepted before a quote booking or a move /
-- delivery request. One row per accepted declaration; text version recorded.

create table if not exists declarations (
  id text primary key,
  user_id text not null,
  kind text not null check (kind in ('quote', 'delivery', 'transport')),
  ref_id text,
  version text not null,
  accepted_at timestamptz not null default now()
);

create index if not exists declarations_user_idx on declarations (user_id, accepted_at desc);
