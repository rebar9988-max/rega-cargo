create table if not exists phone_users (
  id text primary key,
  phone text not null unique,
  name text not null,
  pin_hash text not null,
  pin_salt text not null,
  created_at timestamptz not null default now()
);

create table if not exists phone_sessions (
  token_hash text primary key,
  user_id text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists phone_sessions_user_idx on phone_sessions (user_id);
