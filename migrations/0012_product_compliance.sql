-- Compliance state of a product (see src/lib/compliance). 'pending_review' and 'blocked'
-- products are never published: the app refuses to approve 'blocked' ones and every public
-- query requires compliance_status = 'ok'.
alter table products add column if not exists compliance_status text not null default 'ok';
alter table products add column if not exists compliance_reason jsonb;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_compliance_status_check') then
    alter table products add constraint products_compliance_status_check
      check (compliance_status in ('ok', 'pending_review', 'blocked'));
  end if;
end;
$$;
-- A non-ok product can never be live.
create or replace function products_compliance_unpublish() returns trigger language plpgsql as $$
begin
  if new.compliance_status <> 'ok' and new.status = 'approved' then
    new.status := 'pending';
  end if;
  return new;
end;
$$;
drop trigger if exists products_compliance_unpublish on products;
create trigger products_compliance_unpublish before insert or update on products
  for each row execute function products_compliance_unpublish();
