-- Request-owned, transactional inbox notifications for every entry into review,
-- including customer declines and administrative writes. No external delivery.
create or replace function notify_request_review() returns trigger
language plpgsql as $$
begin
  if new.status <> 'reviewing' then return new; end if;
  if TG_OP = 'UPDATE' then
    if old.status = new.status then return new; end if;
  end if;
  insert into notifications (id, user_id, body_ku, body_en)
    select md5(new.id || ':' || staff.user_id || ':' || gen_random_uuid()::text),
      staff.user_id, 'لە پشکنیندایە: ' || coalesce(new.tracking_id, new.id),
      'Under review: ' || coalesce(new.tracking_id, new.id)
    from (select distinct user_id from user_roles
      where role in ('admin', 'super_admin') and status = 'approved') staff;
  return new;
end;
$$;

-- Reapplying the migration never installs a second copy of the trigger.
do $$ begin
  if not exists (select 1 from pg_trigger
    where tgname = 'shipment_request_review_notice'
      and tgrelid = 'shipment_requests'::regclass) then
    create trigger shipment_request_review_notice
      after insert or update of status on shipment_requests
      for each row execute function notify_request_review();
  end if;
end $$;
