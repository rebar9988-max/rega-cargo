-- Brand names that are sold by name alone (a can of Heineken, an Elfbar) and slipped past the
-- generic words. Additive only: new rows are locked by the compliance_lock_insert trigger and
-- the bundled copy in src/lib/compliance/rules.ts carries the same list. Idempotent.

insert into prohibited_keywords (category_id, keyword, language, level)
select c.id, k.keyword, k.language, k.level
from (values
  ('alcohol', 'smirnoff', 'en', 'block'),
  ('alcohol', 'jägermeister', 'en', 'block'),
  ('alcohol', 'jack daniel', 'en', 'block'),
  ('alcohol', 'johnnie walker', 'en', 'block'),
  ('alcohol', 'jim beam', 'en', 'block'),
  ('alcohol', 'chivas regal', 'en', 'block'),
  ('alcohol', 'bacardi', 'en', 'block'),
  ('alcohol', 'baileys', 'en', 'block'),
  ('alcohol', 'hennessy', 'en', 'block'),
  ('alcohol', 'moet chandon', 'en', 'block'),
  ('alcohol', 'aperol', 'en', 'block'),
  ('alcohol', 'campari', 'en', 'block'),
  ('alcohol', 'heineken', 'en', 'block'),
  ('alcohol', 'budweiser', 'en', 'block'),
  ('alcohol', 'carlsberg', 'en', 'block'),
  ('alcohol', 'corona extra', 'en', 'block'),
  ('alcohol', 'arak', 'en', 'block'),
  ('alcohol', 'ouzo', 'en', 'block'),
  ('alcohol', 'captain morgan', 'en', 'review'),
  ('alcohol', 'martini', 'en', 'review'),
  ('tobacco_smoking', 'marlboro', 'en', 'block'),
  ('tobacco_smoking', 'terea', 'en', 'block'),
  ('tobacco_smoking', 'glo hyper', 'en', 'block'),
  ('tobacco_smoking', 'al fakher', 'en', 'block'),
  ('tobacco_smoking', 'zyn', 'en', 'block'),
  ('tobacco_smoking', 'lucky strike', 'en', 'block'),
  ('vape', 'elfbar', 'en', 'block'),
  ('vape', 'geek bar', 'en', 'block'),
  ('vape', 'geekbar', 'en', 'block'),
  ('vape', 'lost mary', 'en', 'block'),
  ('vape', 'vozol', 'en', 'block'),
  ('vape', 'relx', 'en', 'block'),
  ('vape', 'vaporesso', 'en', 'block'),
  ('vape', 'voopoo', 'en', 'block'),
  ('pork', 'jamon', 'en', 'block')
) as k (slug, keyword, language, level)
join prohibited_categories c on c.slug = k.slug
on conflict (category_id, keyword, language) do nothing;
