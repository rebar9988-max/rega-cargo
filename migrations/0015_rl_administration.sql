-- Additive R&L authority/operations metadata. No user is granted a role here.
alter table user_roles drop constraint if exists user_roles_role_check;
alter table user_roles add constraint user_roles_role_check check (role in ('buyer', 'seller', 'courier', 'admin', 'super_admin'));
alter table phone_users add column if not exists disabled_at timestamptz;
alter table phone_users add column if not exists provisioned_at timestamptz;
alter table phone_users add column if not exists requires_verification boolean not null default false;
alter table products add column if not exists archived_at timestamptz;
alter table categories add column if not exists archived_at timestamptz;
alter table offers add column if not exists archived_at timestamptz;
alter table reviews add column if not exists archived_at timestamptz;
alter table reports add column if not exists archived_at timestamptz;
alter table reports add column if not exists status text not null default 'open' check (status in ('open', 'closed'));
alter table shipment_requests add column if not exists archived_at timestamptz;
alter table delivery_requests add column if not exists archived_at timestamptz;
alter table transport_requests add column if not exists archived_at timestamptz;
alter table tracking_events add column if not exists archived_at timestamptz;
alter table tracking_events add column if not exists occurred_at timestamptz;
alter table tracking_events add column if not exists next_action text not null default 'none' check (next_action in ('none', 'wait', 'invoice', 'contact', 'delivery'));
alter table tracking_events add column if not exists estimate_from timestamptz;
alter table tracking_events add column if not exists estimate_to timestamptz;
alter table tracking_events drop constraint if exists tracking_estimate_window;
alter table tracking_events add constraint tracking_estimate_window check ((estimate_from is null and estimate_to is null) or (estimate_from is not null and estimate_to is not null and estimate_to >= estimate_from));

-- Shared control plane only. Marketplace, orders, delivery, tracking and AI retain ownership.
create table if not exists platform_settings (
  key text primary key check (key in ('ai.assistant.enabled', 'ai.assistant.daily_cap', 'operations.note')),
  value jsonb not null,
  updated_by text not null,
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);
create table if not exists platform_audit_log (
  id text primary key,
  actor_id text not null,
  module text not null check (module in ('market', 'orders', 'delivery', 'tracking', 'ai', 'identity', 'settings')),
  resource text not null,
  resource_id text not null,
  action text not null check (action in ('create', 'update', 'delete')),
  fields jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists platform_audit_actor_idx on platform_audit_log(actor_id, created_at);

create or replace function rl_immutable_admin_audit() returns trigger language plpgsql as $$
begin raise exception 'R&L administrative audit records are immutable'; end;
$$;
drop trigger if exists rl_admin_audit_immutable on platform_audit_log;
create trigger rl_admin_audit_immutable before update or delete on platform_audit_log for each row execute function rl_immutable_admin_audit();

-- Serialize authority removals so concurrent revocations cannot remove the last approved owner.
create or replace function rl_preserve_super_admin() returns trigger language plpgsql as $$
begin
  if old.role = 'super_admin' and old.status = 'approved' and
    (TG_OP = 'DELETE' or new.status <> 'approved' or new.role <> 'super_admin') then
    perform pg_advisory_xact_lock(20261013, 15);
    if not exists (select 1 from user_roles where role = 'super_admin' and status = 'approved' and user_id <> old.user_id) then
      raise exception 'Cannot remove the last approved SUPER_ADMIN';
    end if;
  end if;
  if TG_OP = 'DELETE' then return old; end if;
  return new;
end;
$$;
drop trigger if exists rl_super_admin_guard on user_roles;
create trigger rl_super_admin_guard before update or delete on user_roles for each row execute function rl_preserve_super_admin();
