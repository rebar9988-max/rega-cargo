create table if not exists phone_codes (
  phone text primary key,
  code_hash text not null,
  code_salt text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0
);
