-- Administrative email sign-in codes, kept apart from the customer codes.
--
-- Additive: one new table, nothing existing is touched. The customer table is keyed by
-- address, so a stranger who knows an owner's address could occupy that single row (and
-- its cooldown and guess budget) through the public endpoint and keep the owner out of
-- their own administration. A separate table gives administrative sign-in its own
-- cooldown, its own guess count and its own rate-limit keys.
--
-- Same shape and same guarantees as email_codes: one live code per address, stored only
-- as an HMAC, short lived, single use, with the guess count on the row.
create table if not exists admin_codes (
  email text primary key check (email = lower(email)),
  code_hash text not null,
  state text not null default 'pending' check (state in ('pending', 'active')),
  expires_at timestamptz not null,
  attempts integer not null default 0,
  sent_at timestamptz not null default now()
);
