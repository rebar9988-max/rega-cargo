-- Email sign-in codes (additive). One row per normalized address; only an HMAC of the
-- code is stored. A row is usable only once delivery succeeded (state = 'active').
create table if not exists email_codes (
  email text primary key check (email = lower(email)),
  code_hash text not null,
  state text not null default 'pending' check (state in ('pending', 'active')),
  expires_at timestamptz not null,
  attempts integer not null default 0,
  sent_at timestamptz not null default now()
);
