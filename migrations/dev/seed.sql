-- Dev-only sample rows. Applied for PGLite/dev, never by scripts/migrate.mjs.
insert into user_roles (user_id, role, status, display_name, city) values
  ('dev-user', 'buyer', 'approved', 'Dev', 'هەولێر'),
  ('dev-user', 'seller', 'approved', 'فرۆشگای هەولێر', 'هەولێر'),
  ('dev-user', 'courier', 'approved', 'شۆفێری هەولێر', 'هەولێر'),
  ('dev-user', 'admin', 'approved', 'بەڕێوەبەر', 'هەولێر'),
  ('seed-slemani', 'seller', 'approved', 'بازاڕی سلێمانی', 'سلێمانی'),
  ('seed-duhok', 'seller', 'approved', 'دوکانی دهۆک', 'دهۆک'),
  ('seed-kirkuk', 'seller', 'pending', 'فرۆشیاری کەرکووک', 'کەرکووک'),
  ('seed-driver', 'courier', 'approved', 'شۆفێری سلێمانی', 'سلێمانی')
on conflict (user_id, role) do nothing;

insert into products (id, slug, owner_id, category_id, name_ku, name_en, description_ku, brand, specs, image, status) values
  ('earbuds', 'earbuds', 'seed-slemani', 'electronics', 'بیستۆکی بێوایەر', 'Wireless earbuds', 'بیستۆکی بچووک بۆ ڕۆژانە. نموونەی بەراوردە، کڕین لەلای فرۆشیارە.', 'Hêlîn', 'بێ وایەر', '/bazaar/earbuds.jpg', 'approved'),
  ('kettle', 'kettle', 'dev-user', 'home', 'کەتڵی کارەبایی', 'Electric kettle', 'کەتڵی سادە بۆ چای. نرخەکان بۆ بەراوردن.', 'Roj', '١.٧ لیتر', '/bazaar/kettle.jpg', 'approved'),
  ('cream', 'cream', 'seed-duhok', 'beauty', 'کرێمی دەموچاو', 'Face cream', 'کرێمی ڕۆژانە. شلە ڕەنگە لە گواستنەوەی ئاسمانی سنووردار بێت.', 'Şane', '٥٠ مل', '/bazaar/cream.jpg', 'approved'),
  ('sneakers', 'sneakers', 'seed-slemani', 'fashion', 'پێڵاوی وەرزشی', 'Sneakers', 'پێڵاوی سپی. قەبارە لەلای فرۆشیار پشتڕاست دەکرێتەوە.', 'Nwe', 'قەبارە ٣٦–٤٤', '/bazaar/sneakers.jpg', 'approved'),
  ('perfume', 'perfume', 'dev-user', 'beauty', 'عەتر', 'Perfume', 'بۆن. ڕەنگە باری ئاسمانی وەری نەگرێت.', 'Dilan', '٥٠ مل', '/bazaar/perfume.jpg', 'approved'),
  ('ball', 'ball', 'seed-duhok', 'sports', 'تۆپی تۆپ', 'Football', 'تۆپی ڕاهێنان.', 'Roj', 'قەبارە ٥', '/bazaar/ball.jpg', 'approved'),
  ('baby', 'baby', 'seed-slemani', 'baby', 'جلی منداڵ', 'Baby clothes', 'جلی نەرمی منداڵ.', 'Hêlîn', '٠–١٢ مانگ', '/bazaar/baby.jpg', 'approved'),
  ('dress', 'dress', 'seed-kirkuk', 'fashion', 'جلی ڕۆژانە', 'Everyday dress', 'چاوەڕوانی پەسەندی بەڕێوەبەرە.', 'Nwe', 'قەبارە S–L', '/bazaar/dress.jpg', 'pending')
on conflict (id) do nothing;

insert into offers (id, product_id, seller_id, price_iqd, shipping_iqd, stock, contact, status) values
  ('o1', 'earbuds', 'dev-user', 45000, 0, 'in', 'https://example.com/erbil/earbuds', 'approved'),
  ('o2', 'earbuds', 'seed-slemani', 47000, 2000, 'in', 'https://example.com/slemani/earbuds', 'approved'),
  ('o3', 'earbuds', 'seed-duhok', 44000, 4000, 'low', 'https://example.com/duhok/earbuds', 'approved'),
  ('o4', 'kettle', 'dev-user', 32000, 0, 'in', 'https://example.com/erbil/kettle', 'approved'),
  ('o5', 'kettle', 'seed-slemani', 30000, 3000, 'in', 'https://example.com/slemani/kettle', 'approved'),
  ('o6', 'kettle', 'seed-duhok', 35000, 0, 'out', 'https://example.com/duhok/kettle', 'approved'),
  ('o7', 'cream', 'seed-slemani', 18000, 0, 'in', 'https://example.com/slemani/cream', 'approved'),
  ('o8', 'cream', 'dev-user', 17500, 1500, 'in', 'https://example.com/erbil/cream', 'approved'),
  ('o9', 'sneakers', 'seed-duhok', 65000, 0, 'in', 'https://example.com/duhok/sneakers', 'approved'),
  ('o10', 'sneakers', 'dev-user', 69000, 0, 'in', 'https://example.com/erbil/sneakers', 'approved'),
  ('o11', 'sneakers', 'seed-slemani', 64000, 2500, 'in', 'https://example.com/slemani/sneakers', 'approved'),
  ('o12', 'perfume', 'dev-user', 54000, 0, 'in', 'https://example.com/erbil/perfume', 'approved'),
  ('o13', 'perfume', 'seed-slemani', 51000, 2000, 'low', 'https://example.com/slemani/perfume', 'approved'),
  ('o14', 'ball', 'seed-slemani', 15000, 0, 'in', 'https://example.com/slemani/ball', 'approved'),
  ('o15', 'ball', 'dev-user', 16000, 1000, 'in', 'https://example.com/erbil/ball', 'approved'),
  ('o16', 'ball', 'seed-duhok', 14500, 2000, 'in', 'https://example.com/duhok/ball', 'approved'),
  ('o17', 'baby', 'dev-user', 28000, 0, 'in', 'https://example.com/erbil/baby', 'approved'),
  ('o18', 'baby', 'seed-slemani', 27000, 2000, 'low', 'https://example.com/slemani/baby', 'approved')
on conflict (id) do nothing;

insert into price_history (id, offer_id, price_iqd, shipping_iqd, recorded_at) values
  ('h1', 'o1', 52000, 0, now() - interval '40 days'),
  ('h2', 'o1', 48000, 0, now() - interval '12 days'),
  ('h3', 'o1', 45000, 0, now() - interval '1 day'),
  ('h4', 'o5', 36000, 3000, now() - interval '30 days'),
  ('h5', 'o5', 30000, 3000, now() - interval '2 days'),
  ('h6', 'o11', 70000, 2500, now() - interval '20 days'),
  ('h7', 'o11', 64000, 2500, now() - interval '3 days')
on conflict (id) do nothing;

insert into shipment_requests (id, user_id, kind, name, phone, payload, estimate_eur, status, tracking_id) values
  ('sample-48291', 'dev-user', 'quote', 'Dev', '+490000000000', '{"from":"ber","to":"ebl"}', 22, 'in_transit', 'RG-48291'),
  ('sample-22910', 'dev-user', 'quote', 'Dev', '+490000000000', '{"from":"sto","to":"sul"}', 40, 'in_transit', 'RG-22910'),
  ('sample-77420', 'dev-user', 'quote', 'Dev', '+490000000000', '{"from":"lon","to":"dhk"}', 35, 'received', 'RG-77420')
on conflict (id) do nothing;
