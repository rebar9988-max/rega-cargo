-- Marketplace trust: review moderation, one-shot price alerts, indexes.

alter table reviews add column if not exists status text not null default 'pending';

alter table price_alerts add column if not exists notified boolean not null default false;

create index if not exists offers_seller_idx on offers (seller_id);
create index if not exists user_roles_role_status_idx on user_roles (role, status);
create index if not exists reviews_product_idx on reviews (product_id);
create index if not exists notifications_unread_idx on notifications (user_id, read_at);
