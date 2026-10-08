-- Forward-only cleanup of dev seed rows. Never drops tables.
-- Safe when those rows were never inserted.

delete from price_history where id like 'h%' and offer_id like 'o%';
delete from price_history where offer_id in (select id from offers where seller_id = 'dev-user' or seller_id like 'seed-%');
delete from offers where seller_id = 'dev-user' or seller_id like 'seed-%' or id like 'o%';
delete from favorites where product_id in (select id from products where owner_id = 'dev-user' or owner_id like 'seed-%');
delete from price_alerts where product_id in (select id from products where owner_id = 'dev-user' or owner_id like 'seed-%');
delete from reviews where product_id in (select id from products where owner_id = 'dev-user' or owner_id like 'seed-%');
delete from products where owner_id = 'dev-user' or owner_id like 'seed-%' or id in ('earbuds','kettle','cream','sneakers','perfume','ball','baby','dress');
delete from user_roles where user_id = 'dev-user' or user_id like 'seed-%';
delete from notifications where user_id = 'dev-user' or user_id like 'seed-%';
