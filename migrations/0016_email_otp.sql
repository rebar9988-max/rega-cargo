-- Email one-time-code sign-in. Additive: existing phone accounts, sessions and roles are unchanged.
-- Email accounts live in phone_users (same sessions, roles and middleware), with phone left empty.

alter table phone_users alter column phone drop not null;
alter table phone_users add column if not exists email text;
create unique index if not exists phone_users_email_key on phone_users (email) where email is not null;
alter table phone_users drop constraint if exists phone_users_identity_check;
alter table phone_users add constraint phone_users_identity_check check (phone is not null or email is not null);

-- One pending code per address. Only an HMAC of the code is stored; a code is deleted when used.
create table if not exists email_codes (
  email text primary key,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  sent_at timestamptz not null default now()
);
