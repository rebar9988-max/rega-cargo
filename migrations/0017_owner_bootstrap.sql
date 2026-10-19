-- Identity-owned additive schema. No owner or privileged account is seeded.
alter table "user" add column if not exists disabled_at timestamptz;
create unique index if not exists rl_user_email_normalized on "user"(lower(email));
create table if not exists owner_bootstrap (
  singleton integer primary key default 1 check (singleton = 1),
  approved_email text not null check (approved_email = lower(approved_email)),
  approved_by text not null check (length(approved_by) > 0),
  ownership_proof jsonb not null check (jsonb_typeof(ownership_proof) = 'object' and ownership_proof <> '{}'::jsonb),
  approved_at timestamptz not null default now(),
  invitation_hash text not null unique check (invitation_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  user_id text references "user"(id),
  check ((consumed_at is null and user_id is null) or (consumed_at is not null and user_id is not null))
);

-- This operation is called only after Better Auth authenticates the same user.
-- Nonce verification, role assignment, disabling bootstrap and audit are atomic.
create or replace function rl_activate_first_owner(p_hash text, p_user_id text)
returns boolean language plpgsql as $$
declare ticket owner_bootstrap%rowtype; identity_row "user"%rowtype;
begin
  perform pg_advisory_xact_lock(20261013, 15);
  select * into ticket from owner_bootstrap where singleton = 1 for update;
  if not found or ticket.consumed_at is not null or ticket.expires_at <= now()
    or ticket.invitation_hash <> p_hash then return false; end if;
  if exists (select 1 from user_roles where role = 'super_admin' and status = 'approved') then return false; end if;
  select * into identity_row from "user" where id = p_user_id for update;
  if not found or lower(identity_row.email) <> ticket.approved_email or identity_row.disabled_at is not null then return false; end if;
  update "user" set "emailVerified" = true, "updatedAt" = now() where id = p_user_id;
  insert into user_roles(user_id, role, status, display_name)
    values(p_user_id, 'super_admin', 'approved', identity_row.name)
    on conflict(user_id, role) do update set status = 'approved';
  update owner_bootstrap set consumed_at = now(), user_id = p_user_id where singleton = 1;
  insert into platform_audit_log(id, actor_id, module, resource, resource_id, action, fields)
    values('owner-bootstrap-activation', p_user_id, 'identity', 'owner_bootstrap', '1', 'update',
      jsonb_build_object('email_verified', true, 'role', 'super_admin', 'approved_by', ticket.approved_by, 'ownership_proof', ticket.ownership_proof));
  return true;
end;
$$;

-- Once completed, normal SQL writes cannot reopen or retarget this bootstrap.
create or replace function rl_preserve_completed_bootstrap() returns trigger language plpgsql as $$
begin
  if old.consumed_at is not null then raise exception 'Owner bootstrap is permanently closed'; end if;
  if TG_OP = 'DELETE' then return old; end if;
  return new;
end;
$$;
drop trigger if exists rl_owner_bootstrap_closed on owner_bootstrap;
create trigger rl_owner_bootstrap_closed before update or delete on owner_bootstrap
  for each row execute function rl_preserve_completed_bootstrap();
