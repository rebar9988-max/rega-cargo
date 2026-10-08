-- Marketplace tables. user_id matches Better Auth "user".id (text).
-- No foreign key: the auth schema is optional and is not applied when sign-in is off.

create table if not exists user_roles (
  user_id text not null,
  role text not null check (role in ('buyer', 'seller', 'courier', 'admin')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'removed')),
  display_name text,
  city text,
  phone text,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists categories (
  id text primary key,
  name_ku text not null,
  name_en text not null
);

create table if not exists products (
  id text primary key,
  slug text not null unique,
  owner_id text not null,
  category_id text not null references categories (id),
  name_ku text not null,
  name_en text not null,
  description_ku text not null default '',
  brand text not null,
  specs text not null default '',
  image text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'removed')),
  created_at timestamptz not null default now()
);

create index if not exists products_list_idx on products (status, created_at desc);

create table if not exists offers (
  id text primary key,
  product_id text not null references products (id),
  seller_id text not null,
  price_iqd integer not null check (price_iqd >= 0 and price_iqd <= 50000000),
  shipping_iqd integer not null default 0 check (shipping_iqd >= 0 and shipping_iqd <= 5000000),
  stock text not null check (stock in ('in', 'low', 'out')),
  contact text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'removed', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, seller_id)
);

create index if not exists offers_product_idx on offers (product_id, status);

create table if not exists price_history (
  id text primary key,
  offer_id text not null references offers (id),
  price_iqd integer not null,
  shipping_iqd integer not null,
  recorded_at timestamptz not null default now()
);

create index if not exists price_history_offer_idx on price_history (offer_id, recorded_at);

create table if not exists favorites (
  user_id text not null,
  product_id text not null references products (id),
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists price_alerts (
  id text primary key,
  user_id text not null,
  product_id text not null references products (id),
  target_iqd integer not null check (target_iqd > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists reviews (
  id text primary key,
  user_id text not null,
  product_id text references products (id),
  job_kind text,
  job_id text,
  target_user_id text,
  rating integer not null check (rating between 1 and 5),
  body text not null default '',
  created_at timestamptz not null default now()
);

create unique index if not exists reviews_product_user_idx
  on reviews (user_id, product_id) where product_id is not null;

create unique index if not exists reviews_job_user_idx
  on reviews (user_id, job_kind, job_id) where job_id is not null;

create table if not exists reports (
  id text primary key,
  user_id text not null,
  subject text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id text primary key,
  user_id text not null,
  body_ku text not null,
  body_en text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on notifications (user_id, created_at desc);

create table if not exists action_log (
  id text primary key,
  user_id text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists action_log_user_idx on action_log (user_id, action, created_at);

insert into categories (id, name_ku, name_en) values
  ('beauty', 'جوانکاری', 'Beauty'),
  ('fashion', 'جلوبەرگ', 'Fashion'),
  ('electronics', 'ئەلیکترۆنی', 'Electronics'),
  ('home', 'ماڵ', 'Home'),
  ('baby', 'منداڵ', 'Baby'),
  ('sports', 'وەرزش', 'Sports')
on conflict (id) do nothing;
