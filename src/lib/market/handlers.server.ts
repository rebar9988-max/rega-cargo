import { getSql, type Sql } from "@/lib/db";
import { checkProduct, isProhibitedQuery } from "@/lib/compliance/check";
import {
  auditLog,
  checkProductServer,
  checkTextServer,
  complianceRules,
} from "@/lib/compliance/service.server";
import {
  MarketError,
  canSetJobStatus,
  cheapest,
  cleanContact,
  cleanImage,
  cleanMoney,
  cleanOptional,
  cleanStock,
  cleanText,
  areaOnly,
  likePattern,
  offerTotal,
  pageWindow,
  rankOffers,
  slugify,
  type JobKind,
  type JobStatus,
} from "@/lib/market";

import { hasApprovedRole, isSuperAdmin } from "@/lib/auth/authority";

const PAGE = 8;

async function sqlOf() {
  return getSql();
}

/**
 * Compliance for user-written text (reviews, notes, store names, item descriptions, links).
 * A clear prohibited word or a link to a prohibited shop is rejected and logged; review-level
 * words pass (reviews are moderated anyway). Problem reports are NOT checked, so users can
 * still report a prohibited listing.
 */
async function guardUserText(
  sql: Sql,
  userId: string,
  where: string,
  ...texts: (string | null | undefined)[]
) {
  const text = texts.filter(Boolean).join(" \n ");
  if (!text) return;
  const verdict = await checkTextServer(sql, text);
  if (verdict.decision === "block") {
    await auditLog(sql, "rejected_user_text", where, { userId, matches: verdict.matches });
    throw new MarketError("prohibited");
  }
}

async function ensureBuyer(sql: Sql, userId: string) {
  await sql`insert into user_roles (user_id, role, status) values (${userId}, 'buyer', 'approved') on conflict (user_id, role) do nothing`;
}

async function roles(sql: Sql, userId: string) {
  return sql<{
    role: string;
    status: string;
    display_name: string | null;
    city: string | null;
    phone: string | null;
  }>`
    select role, status, display_name, city, phone from user_roles where user_id = ${userId}`;
}

function approved(rows: { role: string; status: string }[], role: string) {
  return hasApprovedRole(rows, role);
}

/**
 * 20 actions of one kind per user per hour. One atomic upsert (the row lock
 * serialises parallel requests), so a burst of simultaneous calls cannot all
 * pass a count taken before any of them was recorded.
 */
async function limit(sql: Sql, userId: string, action: string) {
  const rows = await sql<{ allowed: boolean }>`
    insert into rate_counters (key, n, window_start, allowed)
    values (${`action:${action}:${userId}`}, 1, now(), true)
    on conflict (key) do update set
      allowed = case
        when rate_counters.window_start < now() - interval '1 hour' then true
        when rate_counters.n < 20 then true
        else false
      end,
      window_start = case
        when rate_counters.window_start < now() - interval '1 hour' then now()
        else rate_counters.window_start
      end,
      n = case
        when rate_counters.window_start < now() - interval '1 hour' then 1
        when rate_counters.n < 20 then rate_counters.n + 1
        else rate_counters.n
      end
    returning allowed`;
  if (rows[0]?.allowed !== true) throw new MarketError("rate");
  await sql`insert into action_log (id, user_id, action) values (${crypto.randomUUID()}, ${userId}, ${action})`;
}

async function notify(sql: Sql, userId: string, bodyKu: string, bodyEn: string) {
  await sql`insert into notifications (id, user_id, body_ku, body_en) values (${crypto.randomUUID()}, ${userId}, ${bodyKu}, ${bodyEn})`;
}

async function notifyAdmins(sql: Sql, bodyKu: string, bodyEn: string) {
  await sql`
    insert into notifications (id, user_id, body_ku, body_en)
    select distinct md5(user_id || clock_timestamp()::text || random()::text), user_id, ${bodyKu}, ${bodyEn}
    from user_roles where role in ('admin', 'super_admin') and status = 'approved'`;
}

function log(action: string, userId: string) {
  console.info("[market]", action, userId);
}

export async function getMe(userId: string) {
  const sql = await sqlOf();
  const mine = await roles(sql, userId);
  const notes = await sql<{ id: string; body_ku: string; body_en: string; created_at: string }>`
    select id, body_ku, body_en, created_at from notifications
    where user_id = ${userId} and read_at is null order by created_at desc limit 12`;
  return {
    userId,
    roles: mine.map((row) => ({
      role: row.role,
      status: row.status,
      displayName: row.display_name,
      city: row.city,
      phone: row.phone,
    })),
    notes: notes.map((note) => ({
      id: String(note.id),
      bodyKu: String(note.body_ku),
      bodyEn: String(note.body_en),
    })),
  };
}

export async function requestRole(
  userId: string,
  input: { role?: unknown; displayName?: unknown; city?: unknown; phone?: unknown },
) {
  if (input.role !== "seller" && input.role !== "courier") throw new MarketError("invalid");
  const sql = await sqlOf();
  await ensureBuyer(sql, userId);
  await limit(sql, userId, "role");
  const name = cleanText(input.displayName, 80);
  const city = cleanText(input.city, 40);
  const phone = cleanOptional(input.phone, 30);
  await guardUserText(sql, userId, "user_roles", name, city);
  const rows = await sql<{ status: string }>`
    insert into user_roles (user_id, role, status, display_name, city, phone)
    values (${userId}, ${input.role}, 'pending', ${name}, ${city}, ${phone})
    on conflict (user_id, role) do update set
      display_name = case when user_roles.status = 'removed' then user_roles.display_name else excluded.display_name end,
      city = case when user_roles.status = 'removed' then user_roles.city else excluded.city end,
      phone = case when user_roles.status = 'removed' then user_roles.phone else excluded.phone end,
      status = case
        when user_roles.status = 'removed' then 'removed'
        when user_roles.status = 'approved' and (
          user_roles.display_name is distinct from excluded.display_name
          or user_roles.city is distinct from excluded.city
          or user_roles.phone is distinct from excluded.phone
        ) then 'pending'
        when user_roles.status = 'approved' then 'approved'
        else 'pending'
      end
    returning status`;
  if (rows[0]?.status === "removed") throw new MarketError("forbidden");
  await notifyAdmins(sql, "داواکاریی ڕۆڵی نوێ", "New role request");
  log("role", userId);
  return { ok: true };
}

type ListInput = {
  q?: unknown;
  category?: unknown;
  brand?: unknown;
  min?: unknown;
  max?: unknown;
  stock?: unknown;
  sort?: unknown;
  page?: unknown;
  saved?: unknown;
  userId?: string | null;
};

export async function listProducts(input: ListInput) {
  const sql = await sqlOf();
  const q = typeof input.q === "string" ? input.q.trim().slice(0, 80) : "";
  const category = typeof input.category === "string" ? input.category : "";
  const brand = typeof input.brand === "string" ? input.brand : "";
  const min = input.min === "" || input.min == null ? null : cleanMoney(input.min, 50000000, true);
  const max = input.max === "" || input.max == null ? null : cleanMoney(input.max, 50000000, true);
  const stock = input.stock === "in" ? "in" : "";
  const sort = input.sort === "new" ? "new" : "price";
  const page = pageWindow(input.page);
  const saved = input.saved === true || input.saved === "1";
  const pattern = q ? likePattern(q) : null;
  const offset = (page - 1) * PAGE;
  const rules = await complianceRules(sql);
  // Compliance: a query with a prohibited word returns nothing (no suggestion, no correction).
  const blockedQuery = q !== "" && isProhibitedQuery(q, rules);
  const rows = await sql<Record<string, unknown>>`
    with live as (
      select o.product_id,
             min(o.price_iqd + o.shipping_iqd) filter (where o.stock <> 'out') as lowest,
             count(*)::int as offer_count,
             bool_or(o.stock <> 'out') as available
      from offers o
      join lateral (select display_name, city from user_roles where user_id = o.seller_id and role in ('seller', 'super_admin') and status = 'approved' order by (role = 'seller') desc limit 1) r on true
      where o.status = 'approved'
      group by o.product_id
    )
    select p.slug, p.name_ku, p.name_en, p.brand, p.image, p.category_id, p.created_at,
           c.name_ku as category_ku, c.name_en as category_en,
           l.lowest, l.offer_count, l.available,
           count(*) over()::int as total_count
    from products p
    join categories c on c.id = p.category_id and c.archived_at is null
    left join live l on l.product_id = p.id
    where p.status = 'approved' and p.compliance_status = 'ok'
      and (${pattern}::text is null or p.name_ku ilike ${pattern} escape '\\' or p.name_en ilike ${pattern} escape '\\' or p.brand ilike ${pattern} escape '\\')
      and (${category} = '' or p.category_id = ${category})
      and (${brand} = '' or p.brand = ${brand})
      and (${min}::int is null or l.lowest >= ${min})
      and (${max}::int is null or l.lowest <= ${max})
      and (${stock} = '' or l.available)
      and (${saved} = false or exists (select 1 from favorites f where f.product_id = p.id and f.user_id = ${input.userId ?? ""}))
    order by case when ${sort} = 'new' then extract(epoch from p.created_at) end desc nulls last,
             l.lowest asc nulls last, p.name_en asc
    limit ${PAGE} offset ${offset}`;
  // Defence in depth: rows that now clearly match a rule (e.g. written before a keyword was added) never show.
  const visible = blockedQuery
    ? []
    : rows.filter(
        (row) =>
          checkProduct(
            {
              title: String(row.name_en),
              titleKu: String(row.name_ku),
              brand: String(row.brand),
              category: String(row.category_id),
            },
            rules,
          ).decision !== "block",
      );
  const brands = await sql<{
    brand: string;
  }>`select distinct brand from products where status = 'approved' and compliance_status = 'ok' order by brand`;
  const cats = await sql<{
    id: string;
    name_ku: string;
    name_en: string;
  }>`select id, name_ku, name_en from categories where archived_at is null order by name_en`;
  const total = blockedQuery ? 0 : Number(rows[0]?.total_count ?? 0);
  return {
    items: visible.map((row) => ({
      slug: String(row.slug),
      nameKu: String(row.name_ku),
      nameEn: String(row.name_en),
      brand: String(row.brand),
      image: row.image ? String(row.image) : null,
      categoryId: String(row.category_id),
      lowest: row.lowest == null ? null : Number(row.lowest),
      offerCount: Number(row.offer_count ?? 0),
    })),
    page,
    pages: Math.max(1, Math.ceil(total / PAGE)),
    brands: brands.map((row) => row.brand).filter((name) => !isProhibitedQuery(name, rules)),
    categories: cats,
  };
}

export async function getProduct(slug: string, userId: string | null) {
  const sql = await sqlOf();
  const found = await sql<Record<string, unknown>>`
    select p.*, c.name_ku as category_ku, c.name_en as category_en
    from products p join categories c on c.id = p.category_id and c.archived_at is null
    where p.slug = ${slug} and p.status = 'approved' and p.compliance_status = 'ok'`;
  const product = found[0];
  if (!product) throw new MarketError("notfound");
  const verdict = await checkProductServer(sql, {
    title: String(product.name_en),
    titleKu: String(product.name_ku),
    brand: String(product.brand),
    category: String(product.category_id),
    description: String(product.description_ku ?? ""),
    attributes: String(product.specs ?? ""),
  });
  // An admin may have cleared a review-level match; a clear match never shows.
  if (verdict.decision === "block") throw new MarketError("notfound");
  const raw = await sql<Record<string, unknown>>`
    select o.id, o.price_iqd, o.shipping_iqd, o.stock, o.contact, o.seller_id, o.updated_at,
           coalesce(r.display_name, o.seller_id) as seller_name, r.city
    from offers o
    join lateral (select display_name, city from user_roles where user_id = o.seller_id and role in ('seller', 'super_admin') and status = 'approved' order by (role = 'seller') desc limit 1) r on true
    where o.product_id = ${product.id} and o.status = 'approved'`;
  const offers = rankOffers(
    raw.map((row) => ({
      id: String(row.id),
      price: Number(row.price_iqd),
      shipping: Number(row.shipping_iqd),
      stock: row.stock as "in" | "low" | "out",
      contact: String(row.contact),
      sellerId: String(row.seller_id),
      sellerName: String(row.seller_name),
      city: row.city ? String(row.city) : "",
      total: 0,
    })),
  );
  const best = cheapest(offers);
  const history = best
    ? await sql<{ price_iqd: number; shipping_iqd: number; recorded_at: string }>`
        select price_iqd, shipping_iqd, recorded_at from price_history where offer_id = ${best.id} order by recorded_at`
    : [];
  const reviewRows = await sql<{ rating: number; body: string; created_at: string }>`
    select rating, body, created_at from reviews
    where product_id = ${product.id} and status = 'approved' order by created_at desc limit 12`;
  const avgRows = await sql<{ avg: number | null }>`
    select avg(rating) as avg from reviews where product_id = ${product.id} and status = 'approved'`;
  let favorite = false;
  let alert: number | null = null;
  if (userId) {
    const fav =
      await sql`select 1 as ok from favorites where user_id = ${userId} and product_id = ${product.id}`;
    favorite = fav.length > 0;
    const alerts = await sql<{
      target_iqd: number;
    }>`select target_iqd from price_alerts where user_id = ${userId} and product_id = ${product.id}`;
    alert = alerts[0] ? Number(alerts[0].target_iqd) : null;
  }
  const avg = avgRows[0]?.avg == null ? null : Number(avgRows[0].avg);
  return {
    slug: String(product.slug),
    nameKu: String(product.name_ku),
    nameEn: String(product.name_en),
    descriptionKu: String(product.description_ku),
    brand: String(product.brand),
    specs: String(product.specs),
    image: product.image ? String(product.image) : null,
    categoryKu: String(product.category_ku),
    categoryEn: String(product.category_en),
    offers,
    cheapestId: best?.id ?? null,
    history: history.map((point) => ({
      total: offerTotal(Number(point.price_iqd), Number(point.shipping_iqd)),
      at: String(point.recorded_at),
    })),
    reviews: reviewRows.map((row) => ({
      rating: Number(row.rating),
      body: row.body,
      at: String(row.created_at),
    })),
    avg,
    favorite,
    alert,
  };
}

async function checkAlerts(sql: Sql, productId: string) {
  await sql`
    with live as (
      select min(o.price_iqd + o.shipping_iqd) as total
      from offers o
      join lateral (select display_name, city from user_roles where user_id = o.seller_id and role in ('seller', 'super_admin') and status = 'approved' order by (role = 'seller') desc limit 1) r on true
      where o.product_id = ${productId} and o.status = 'approved' and o.stock <> 'out'
    ), reset as (
      update price_alerts set notified = false
      where product_id = ${productId} and notified = true
        and target_iqd < (select total from live)
        and (select total from live) is not null
      returning 1
    ), hits as (
      update price_alerts set notified = true
      where product_id = ${productId} and notified = false
        and (select total from live) is not null
        and target_iqd >= (select total from live)
      returning user_id, target_iqd
    )
    insert into notifications (id, user_id, body_ku, body_en)
    select distinct md5(user_id || target_iqd::text || clock_timestamp()::text), user_id,
           'نرخ کەوتە ژێر ' || target_iqd::text, 'A price fell under ' || target_iqd::text
    from hits`;
}

export async function saveProduct(
  userId: string,
  input: {
    nameKu?: unknown;
    nameEn?: unknown;
    brand?: unknown;
    category?: unknown;
    description?: unknown;
    specs?: unknown;
    image?: unknown;
    price?: unknown;
    shipping?: unknown;
    stock?: unknown;
    contact?: unknown;
  },
) {
  const sql = await sqlOf();
  const mine = await roles(sql, userId);
  if (!approved(mine, "seller")) throw new MarketError("forbidden");
  await limit(sql, userId, "product");
  const nameKu = cleanText(input.nameKu, 80);
  const nameEn = cleanText(input.nameEn, 80);
  const brand = cleanText(input.brand, 40);
  const category = cleanText(input.category, 40);
  const description = cleanOptional(input.description, 1000);
  const specs = cleanOptional(input.specs, 300);
  const image = cleanImage(input.image);
  const price = cleanMoney(input.price, 50000000, false);
  const shipping = cleanMoney(input.shipping ?? 0, 5000000, true);
  const stock = cleanStock(input.stock);
  const contact = cleanContact(input.contact);
  await guardUserText(sql, userId, "offers", contact);
  const cats = await sql`select id from categories where id = ${category}`;
  if (!cats.length) throw new MarketError("invalid");
  // Islamic-compliance check on every text field (no switch can disable it).
  const verdict = await checkProductServer(sql, {
    title: nameEn,
    titleKu: nameKu,
    brand,
    category,
    description,
    attributes: specs,
  });
  if (verdict.decision === "block") {
    await auditLog(sql, "rejected_product", "products", {
      userId,
      nameEn,
      matches: verdict.matches,
    });
    throw new MarketError("prohibited");
  }
  const complianceStatus = verdict.decision === "review" ? "pending_review" : "ok";
  const complianceReason = verdict.matches.length ? JSON.stringify(verdict.matches) : null;
  let slug = "";
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const id = crypto.randomUUID();
    slug = slugify(nameEn);
    const offerId = crypto.randomUUID();
    const historyId = crypto.randomUUID();
    try {
      await sql`
        with product as (
          insert into products (id, slug, owner_id, category_id, name_ku, name_en, description_ku, brand, specs, image, status,
            compliance_status, compliance_reason)
          values (${id}, ${slug}, ${userId}, ${category}, ${nameKu}, ${nameEn}, ${description}, ${brand}, ${specs}, ${image}, 'pending',
            ${complianceStatus}, ${complianceReason}::jsonb)
          returning id
        ), offer as (
          insert into offers (id, product_id, seller_id, price_iqd, shipping_iqd, stock, contact, status)
          select ${offerId}, product.id, ${userId}, ${price}, ${shipping}, ${stock}, ${contact}, 'pending' from product
          returning id
        )
        insert into price_history (id, offer_id, price_iqd, shipping_iqd)
        select ${historyId}, offer.id, ${price}, ${shipping} from offer`;
      break;
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "23505" && attempt < 2) continue;
      throw err;
    }
  }
  await notifyAdmins(sql, "کاڵای نوێ چاوەڕوانی پەسەندە", "A new product is waiting");
  log("product", userId);
  return { slug, review: complianceStatus === "pending_review" };
}

export async function saveOffer(
  userId: string,
  input: {
    slug?: unknown;
    price?: unknown;
    shipping?: unknown;
    stock?: unknown;
    contact?: unknown;
  },
) {
  const sql = await sqlOf();
  const mine = await roles(sql, userId);
  if (!approved(mine, "seller")) throw new MarketError("forbidden");
  await limit(sql, userId, "offer");
  const slug = cleanText(input.slug, 80);
  const price = cleanMoney(input.price, 50000000, false);
  const shipping = cleanMoney(input.shipping ?? 0, 5000000, true);
  const stock = cleanStock(input.stock);
  const contact = cleanContact(input.contact);
  await guardUserText(sql, userId, "offers", contact);
  const products = await sql<{
    id: string;
    status: string;
  }>`select id, status from products where slug = ${slug} and status <> 'removed'`;
  const product = products[0];
  if (!product) throw new MarketError("notfound");
  const existing = await sql<{
    id: string;
    price_iqd: number;
    shipping_iqd: number;
    status: string;
    contact: string;
    stock: string;
  }>`
    select id, price_iqd, shipping_iqd, status, contact, stock from offers where product_id = ${product.id} and seller_id = ${userId}`;
  if (!existing[0]) {
    const offerId = crypto.randomUUID();
    const historyId = crypto.randomUUID();
    await sql`
      with offer as (
        insert into offers (id, product_id, seller_id, price_iqd, shipping_iqd, stock, contact, status)
        values (${offerId}, ${product.id}, ${userId}, ${price}, ${shipping}, ${stock}, ${contact}, 'pending')
        returning id
      )
      insert into price_history (id, offer_id, price_iqd, shipping_iqd)
      select ${historyId}, offer.id, ${price}, ${shipping} from offer`;
    await notifyAdmins(sql, "ئۆفەری نوێ چاوەڕوانی پەسەندە", "A new offer is waiting");
  } else {
    const offer = existing[0];
    if (offer.status === "removed") throw new MarketError("forbidden");
    const priceOnly = offer.contact === contact && offer.stock === stock;
    const nextStatus = offer.status === "approved" && !priceOnly ? "pending" : offer.status;
    const historyId = crypto.randomUUID();
    const changed = Number(offer.price_iqd) !== price || Number(offer.shipping_iqd) !== shipping;
    await sql`
      with upd as (
        update offers set price_iqd = ${price}, shipping_iqd = ${shipping}, stock = ${stock}, contact = ${contact},
          status = ${nextStatus}, updated_at = now()
        where id = ${offer.id} and status <> 'removed'
        returning id
      )
      insert into price_history (id, offer_id, price_iqd, shipping_iqd)
      select ${historyId}, upd.id, ${price}, ${shipping} from upd where ${changed}`;
    if (changed && offer.status === "approved" && priceOnly) {
      await notifyAdmins(sql, "نرخی ئۆفەرێک گۆڕا", "An offer price changed");
      if (product.status === "approved") await checkAlerts(sql, product.id);
    }
    if (!priceOnly && offer.status === "approved") {
      await notifyAdmins(sql, "ئۆفەرێک چاوەڕوانی پێداچوونەوەیە", "An offer needs review");
    }
  }
  log("offer", userId);
  return { ok: true };
}

export async function myOffers(userId: string) {
  const sql = await sqlOf();
  const rows = await sql<Record<string, unknown>>`
    select p.slug, p.name_ku, p.name_en, p.status as product_status, o.price_iqd, o.shipping_iqd, o.stock, o.status as offer_status, o.contact
    from offers o join products p on p.id = o.product_id
    where o.seller_id = ${userId}
    order by o.updated_at desc`;
  return rows.map((row) => ({
    slug: String(row.slug),
    nameKu: String(row.name_ku),
    nameEn: String(row.name_en),
    productStatus: String(row.product_status),
    offerStatus: String(row.offer_status),
    price: Number(row.price_iqd),
    shipping: Number(row.shipping_iqd),
    stock: String(row.stock),
    contact: String(row.contact),
  }));
}

export async function setFavorite(userId: string, slug: string, on: boolean) {
  const sql = await sqlOf();
  await ensureBuyer(sql, userId);
  const products = await sql<{
    id: string;
  }>`select id from products where slug = ${slug} and status = 'approved' and compliance_status = 'ok'`;
  if (!products[0]) throw new MarketError("notfound");
  if (on) {
    await sql`insert into favorites (user_id, product_id) values (${userId}, ${products[0].id}) on conflict do nothing`;
  } else {
    await sql`delete from favorites where user_id = ${userId} and product_id = ${products[0].id}`;
  }
  return { ok: true };
}

export async function setAlert(userId: string, slug: string, target: unknown) {
  const sql = await sqlOf();
  await ensureBuyer(sql, userId);
  await limit(sql, userId, "alert");
  const money = cleanMoney(target, 50000000, false);
  const products = await sql<{
    id: string;
  }>`select id from products where slug = ${slug} and status = 'approved' and compliance_status = 'ok'`;
  if (!products[0]) throw new MarketError("notfound");
  await sql`
    insert into price_alerts (id, user_id, product_id, target_iqd, notified)
    values (${crypto.randomUUID()}, ${userId}, ${products[0].id}, ${money}, false)
    on conflict (user_id, product_id) do update set target_iqd = excluded.target_iqd, notified = false`;
  await checkAlerts(sql, products[0].id);
  return { ok: true };
}

export async function addReview(userId: string, slug: string, rating: unknown, body: unknown) {
  const sql = await sqlOf();
  await ensureBuyer(sql, userId);
  await limit(sql, userId, "review");
  const score = cleanMoney(rating, 5, false);
  const text = cleanOptional(body, 500);
  await guardUserText(sql, userId, "reviews", text);
  const products = await sql<{
    id: string;
    owner_id: string;
  }>`select id, owner_id from products where slug = ${slug} and status = 'approved' and compliance_status = 'ok'`;
  if (!products[0]) throw new MarketError("notfound");
  if (products[0].owner_id === userId) throw new MarketError("forbidden");
  const selling =
    await sql`select 1 as ok from offers where product_id = ${products[0].id} and seller_id = ${userId}`;
  if (selling.length) throw new MarketError("forbidden");
  await sql`
    insert into reviews (id, user_id, product_id, rating, body, status)
    values (${crypto.randomUUID()}, ${userId}, ${products[0].id}, ${score}, ${text}, 'pending')
    on conflict (user_id, product_id) where product_id is not null do update set rating = excluded.rating, body = excluded.body, status = 'pending'`;
  return { ok: true };
}

export async function reportProblem(userId: string, subject: unknown, body: unknown) {
  const sql = await sqlOf();
  await ensureBuyer(sql, userId);
  await limit(sql, userId, "report");
  const title = cleanText(subject, 80);
  const text = cleanText(body, 1000);
  await sql`insert into reports (id, user_id, subject, body) values (${crypto.randomUUID()}, ${userId}, ${title}, ${text})`;
  await notifyAdmins(sql, "سکاڵایەکی نوێ", "A new report");
  log("report", userId);
  return { ok: true };
}

/**
 * Whether the viewer may see admin navigation. Display only: every admin action and the
 * /admin data are refused server-side (adminQueue, adminSet) for anyone else anyway.
 */
export async function viewerIsAdmin(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  const sql = await sqlOf();
  return approved(await roles(sql, userId), "admin");
}

export async function adminQueue(userId: string) {
  const sql = await sqlOf();
  const mine = await roles(sql, userId);
  if (!approved(mine, "admin")) throw new MarketError("forbidden");
  const [pendingRoles, pendingProducts, pendingOffers, openReports, pendingReviews] =
    await Promise.all([
      sql<
        Record<string, unknown>
      >`select user_id, role, display_name, city, phone from user_roles where status = 'pending' order by created_at`,
      sql<
        Record<string, unknown>
      >`select slug, name_ku, name_en, brand, owner_id, compliance_status, compliance_reason from products where status = 'pending' and compliance_status <> 'blocked' order by created_at`,
      sql<
        Record<string, unknown>
      >`select o.id, p.slug, p.name_ku, o.seller_id, o.price_iqd, o.shipping_iqd from offers o join products p on p.id = o.product_id where o.status = 'pending' order by o.created_at`,
      sql<
        Record<string, unknown>
      >`select id, subject, body, created_at from reports where status = 'open' and archived_at is null order by created_at desc limit 20`,
      sql<
        Record<string, unknown>
      >`select id, rating, body from reviews where status = 'pending' and product_id is not null order by created_at limit 20`,
    ]);
  return {
    superAdmin: isSuperAdmin(mine),
    pendingRoles: pendingRoles.map((row) => ({
      userId: String(row.user_id),
      role: String(row.role),
      displayName: row.display_name ? String(row.display_name) : String(row.user_id),
      city: row.city ? String(row.city) : "",
    })),
    pendingProducts: pendingProducts.map((row) => ({
      slug: String(row.slug),
      nameKu: String(row.name_ku),
      nameEn: String(row.name_en),
      brand: String(row.brand),
      review:
        row.compliance_status === "pending_review"
          ? [
              ...new Set(
                (
                  (row.compliance_reason as { matches?: { keyword: string }[] } | null)?.matches ??
                  []
                ).map((m) => m.keyword),
              ),
            ]
          : null,
    })),
    pendingOffers: pendingOffers.map((row) => ({
      id: String(row.id),
      slug: String(row.slug),
      nameKu: String(row.name_ku),
      price: Number(row.price_iqd),
      shipping: Number(row.shipping_iqd),
    })),
    openReports: openReports.map((row) => ({
      id: String(row.id),
      subject: String(row.subject),
      body: String(row.body),
    })),
    pendingReviews: pendingReviews.map((row) => ({
      id: String(row.id),
      rating: Number(row.rating),
      body: String(row.body ?? ""),
    })),
  };
}

export async function adminSet(
  userId: string,
  input: { kind?: unknown; id?: unknown; status?: unknown; role?: unknown },
) {
  const sql = await sqlOf();
  const mine = await roles(sql, userId);
  if (!approved(mine, "admin")) throw new MarketError("forbidden");
  const id = cleanText(input.id, 80);
  const status = input.status === "approved" || input.status === "removed" ? input.status : null;
  if (!status) throw new MarketError("invalid");
  if (input.kind === "role") {
    const role = cleanText(input.role, 20);
    if (!["buyer", "seller", "courier"].includes(role) && !isSuperAdmin(mine))
      throw new MarketError("forbidden");
    if (
      ["admin", "super_admin"].includes(role) &&
      status === "approved" &&
      !(
        await sql`select id from phone_users where id = ${id} and disabled_at is null and requires_verification = false`
      )[0]
    )
      throw new MarketError("forbidden");
    const rows = await sql<{ user_id: string }>`
      update user_roles set status = ${status} where user_id = ${id} and role = ${role} and status <> ${status} returning user_id`;
    if (!rows[0]) throw new MarketError("notfound");
    await notify(
      sql,
      id,
      status === "approved" ? "ڕۆڵەکەت پەسەند کرا" : "ڕۆڵەکەت لابرا",
      status === "approved" ? "Your role was approved" : "Your role was removed",
    );
  } else if (input.kind === "product") {
    if (status === "approved") {
      // A human approval clears a pending_review flag, but never a clear prohibited match.
      const found = await sql<{
        name_en: string;
        name_ku: string;
        brand: string;
        category_id: string;
        description_ku: string;
        specs: string;
        compliance_status: string;
      }>`
        select name_en, name_ku, brand, category_id, description_ku, specs, compliance_status from products where slug = ${id}`;
      const p = found[0];
      if (!p) throw new MarketError("notfound");
      const verdict = await checkProductServer(sql, {
        title: p.name_en,
        titleKu: p.name_ku,
        brand: p.brand,
        category: p.category_id,
        description: p.description_ku,
        attributes: p.specs,
      });
      if (p.compliance_status === "blocked" || verdict.decision === "block") {
        await auditLog(sql, "blocked_approve", "products", {
          userId,
          slug: id,
          matches: verdict.matches,
        });
        throw new MarketError("prohibited");
      }
      if (p.compliance_status === "pending_review" || verdict.decision === "review") {
        await auditLog(sql, "review_cleared", "products", {
          userId,
          slug: id,
          matches: verdict.matches,
        });
        // remembered so a later scan does not flag the same reviewed wording again
        await sql`update products set compliance_reason = ${JSON.stringify({ cleared_by: userId, at: new Date().toISOString(), matches: verdict.matches })}::jsonb where slug = ${id}`;
      }
    }
    const rows = await sql`
      update products set status = ${status},
        compliance_status = case when ${status}::text = 'approved' then 'ok' else compliance_status end
      where slug = ${id} and status <> ${status} returning id`;
    if (!rows[0]) throw new MarketError("notfound");
  } else if (input.kind === "offer") {
    const rows = await sql<{ product_id: string }>`
      update offers set status = ${status} where id = ${id} and status <> ${status} returning product_id`;
    if (!rows[0]) throw new MarketError("notfound");
    if (status === "approved") await checkAlerts(sql, rows[0].product_id);
  } else if (input.kind === "review") {
    const rows =
      await sql`update reviews set status = ${status} where id = ${id} and product_id is not null returning id`;
    if (!rows[0]) throw new MarketError("notfound");
  } else throw new MarketError("invalid");
  log("admin", userId);
  return { ok: true };
}

async function tableOf(kind: JobKind) {
  if (kind !== "delivery" && kind !== "transport") throw new MarketError("invalid");
  return kind === "delivery" ? "delivery_requests" : "transport_requests";
}

export async function createDelivery(
  userId: string,
  input: {
    pickup?: unknown;
    dropoff?: unknown;
    item?: unknown;
    size?: unknown;
    date?: unknown;
    product?: unknown;
    declared?: unknown;
  },
) {
  if (input.declared !== true) throw new MarketError("invalid");
  const sql = await sqlOf();
  await ensureBuyer(sql, userId);
  await limit(sql, userId, "delivery");
  const id = crypto.randomUUID();
  const pickup = cleanText(input.pickup, 200);
  const dropoff = cleanText(input.dropoff, 200);
  const item = cleanText(input.item, 300);
  const size = cleanOptional(input.size, 80);
  const date = cleanOptional(input.date, 20);
  const product = input.product ? cleanText(input.product, 80) : null;
  await guardUserText(sql, userId, "delivery_requests", item, size, pickup, dropoff);
  await sql`
    insert into delivery_requests (id, user_id, product_slug, pickup, dropoff, item_desc, size_note, preferred_date)
    values (${id}, ${userId}, ${product}, ${pickup}, ${dropoff}, ${item}, ${size}, ${date})`;
  await sql`insert into job_status (id, job_kind, job_id, status, actor_id) values (${crypto.randomUUID()}, 'delivery', ${id}, 'requested', ${userId})`;
  await sql`
    insert into declarations (id, user_id, kind, ref_id, version)
    values (${crypto.randomUUID()}, ${userId}, 'delivery', ${id}, '2026-10-09')`;
  log("delivery", userId);
  return { id };
}

export async function createTransport(
  userId: string,
  input: {
    origin?: unknown;
    destination?: unknown;
    load?: unknown;
    date?: unknown;
    declared?: unknown;
  },
) {
  if (input.declared !== true) throw new MarketError("invalid");
  const sql = await sqlOf();
  await ensureBuyer(sql, userId);
  await limit(sql, userId, "transport");
  const id = crypto.randomUUID();
  const origin = cleanText(input.origin, 200);
  const destination = cleanText(input.destination, 200);
  const load = cleanText(input.load, 300);
  const date = cleanOptional(input.date, 20);
  await guardUserText(sql, userId, "transport_requests", load, origin, destination);
  await sql`
    insert into transport_requests (id, user_id, origin, destination, load_desc, preferred_date)
    values (${id}, ${userId}, ${origin}, ${destination}, ${load}, ${date})`;
  await sql`insert into job_status (id, job_kind, job_id, status, actor_id) values (${crypto.randomUUID()}, 'transport', ${id}, 'requested', ${userId})`;
  await sql`
    insert into declarations (id, user_id, kind, ref_id, version)
    values (${crypto.randomUUID()}, ${userId}, 'transport', ${id}, '2026-10-09')`;
  log("transport", userId);
  return { id };
}

export async function listJobs(userId: string) {
  const sql = await sqlOf();
  const mine = await roles(sql, userId);
  const courier = approved(mine, "courier");
  const deliveries = await sql<Record<string, unknown>>`
    select id, user_id, product_slug, pickup, dropoff, item_desc, size_note, preferred_date, status, courier_id, created_at
    from delivery_requests where user_id = ${userId} or courier_id = ${userId} order by created_at desc limit 30`;
  const transports = await sql<Record<string, unknown>>`
    select id, user_id, origin, destination, load_desc, preferred_date, status, courier_id, created_at
    from transport_requests where user_id = ${userId} or courier_id = ${userId} order by created_at desc limit 30`;
  const openDeliveries = courier
    ? await sql<
        Record<string, unknown>
      >`select id, pickup, dropoff, item_desc, size_note, preferred_date, created_at from delivery_requests where status = 'requested' and user_id <> ${userId} order by created_at desc limit 30`
    : [];
  const openTransports = courier
    ? await sql<
        Record<string, unknown>
      >`select id, origin, destination, load_desc, preferred_date, created_at from transport_requests where status = 'requested' and user_id <> ${userId} order by created_at desc limit 30`
    : [];
  const bids = await sql<Record<string, unknown>>`
    select j.job_kind, j.job_id, j.courier_id, j.note, j.status, coalesce(r.display_name, j.courier_id) as name
    from job_offers j
    left join user_roles r on r.user_id = j.courier_id and r.role = 'courier'
    where j.job_id in (
      select id from delivery_requests where user_id = ${userId}
      union select id from transport_requests where user_id = ${userId}
    )`;
  const mapDelivery = (row: Record<string, unknown>) => ({
    id: String(row.id),
    userId: String(row.user_id),
    pickup: String(row.pickup),
    dropoff: String(row.dropoff),
    item: String(row.item_desc),
    status: String(row.status),
    courierId: row.courier_id ? String(row.courier_id) : null,
  });
  const mapTransport = (row: Record<string, unknown>) => ({
    id: String(row.id),
    userId: String(row.user_id),
    origin: String(row.origin),
    destination: String(row.destination),
    load: String(row.load_desc),
    status: String(row.status),
    courierId: row.courier_id ? String(row.courier_id) : null,
  });
  return {
    courier,
    deliveries: deliveries.map(mapDelivery),
    transports: transports.map(mapTransport),
    openDeliveries: openDeliveries.map((row) => ({
      id: String(row.id),
      pickup: areaOnly(String(row.pickup)),
      dropoff: areaOnly(String(row.dropoff)),
      item: String(row.item_desc),
    })),
    openTransports: openTransports.map((row) => ({
      id: String(row.id),
      origin: areaOnly(String(row.origin)),
      destination: areaOnly(String(row.destination)),
      load: String(row.load_desc),
    })),
    bids: bids.map((row) => ({
      kind: String(row.job_kind),
      jobId: String(row.job_id),
      courierId: String(row.courier_id),
      name: String(row.name),
      status: String(row.status),
    })),
  };
}

export async function offerJob(userId: string, kind: JobKind, jobId: string, note: unknown) {
  const sql = await sqlOf();
  const mine = await roles(sql, userId);
  if (!approved(mine, "courier")) throw new MarketError("forbidden");
  await limit(sql, userId, "bid");
  const text = cleanOptional(note, 200);
  await guardUserText(sql, userId, "job_offers", text);
  const table = await tableOf(kind);
  const jobs = await sql.query<{ user_id: string; status: string }>(
    `select user_id, status from ${table} where id = $1`,
    [jobId],
  );
  const job = jobs[0];
  if (!job || job.status !== "requested") throw new MarketError("notfound");
  if (job.user_id === userId) throw new MarketError("forbidden");
  await sql`
    insert into job_offers (id, job_kind, job_id, courier_id, note)
    values (${crypto.randomUUID()}, ${kind}, ${jobId}, ${userId}, ${text})
    on conflict (job_kind, job_id, courier_id) do update set note = excluded.note`;
  await notify(sql, job.user_id, "شۆفێرێک ئامادەیە", "A driver offered to take the job");
  return { ok: true };
}

export async function chooseCourier(
  userId: string,
  kind: JobKind,
  jobId: string,
  courierId: string,
) {
  const sql = await sqlOf();
  const table = await tableOf(kind);
  const jobs = await sql.query<{ user_id: string; status: string }>(
    `select user_id, status from ${table} where id = $1`,
    [jobId],
  );
  const job = jobs[0];
  if (!job || job.user_id !== userId || job.status !== "requested")
    throw new MarketError("forbidden");
  const bids = await sql<{ courier_id: string }>`
    select courier_id from job_offers where job_kind = ${kind} and job_id = ${jobId} and courier_id = ${courierId} and status = 'offered'`;
  if (!bids[0]) throw new MarketError("notfound");
  const logId = crypto.randomUUID();
  const chosen = await sql.query<{ id: string }>(
    `with job as (
       update ${table} set status = 'accepted', courier_id = $1
       where id = $2 and user_id = $3 and status = 'requested'
         and exists (
           select 1 from job_offers where job_kind = $4 and job_id = $2 and courier_id = $1 and status = 'offered'
         )
       returning id
     ), decline as (
       update job_offers set status = 'declined'
       where job_kind = $4 and job_id = $2 and exists (select 1 from job)
       returning id
     ), pick as (
       update job_offers set status = 'chosen'
       where job_kind = $4 and job_id = $2 and courier_id = $1 and exists (select 1 from job)
       returning id
     )
     insert into job_status (id, job_kind, job_id, status, actor_id)
     select $5, $4, $2, 'accepted', $3 from job
     returning id`,
    [courierId, jobId, userId, kind, logId],
  );
  if (!chosen[0]) throw new MarketError("forbidden");
  await notify(sql, courierId, "کارەکەت هەڵبژێردرا", "You were chosen for a job");
  return { ok: true };
}

export async function setJobStatus(userId: string, kind: JobKind, jobId: string, next: JobStatus) {
  const sql = await sqlOf();
  const table = await tableOf(kind);
  const jobs = await sql.query<{ user_id: string; status: JobStatus; courier_id: string | null }>(
    `select user_id, status, courier_id from ${table} where id = $1`,
    [jobId],
  );
  const job = jobs[0];
  if (!job) throw new MarketError("notfound");
  const who = job.user_id === userId ? "requester" : job.courier_id === userId ? "courier" : null;
  if (!who || !canSetJobStatus(job.status, next, who)) throw new MarketError("forbidden");
  const logId = crypto.randomUUID();
  const updated = await sql.query<{ id: string }>(
    `with upd as (
       update ${table} set status = $1
       where id = $2 and status = $3 and (
         ($1 = 'cancelled' and user_id = $4 and status in ('requested', 'accepted', 'picked_up', 'on_the_way'))
         or (courier_id = $4 and (
           (status = 'accepted' and $1 = 'picked_up')
           or (status = 'picked_up' and $1 = 'on_the_way')
           or (status = 'on_the_way' and $1 = 'delivered')
         ))
       )
       returning id
     )
     insert into job_status (id, job_kind, job_id, status, actor_id)
     select $5, $6, upd.id, $1, $4 from upd
     returning id`,
    [next, jobId, job.status, userId, logId, kind],
  );
  if (!updated[0]) throw new MarketError("forbidden");
  const other = who === "requester" ? job.courier_id : job.user_id;
  if (other) await notify(sql, other, `دۆخ: ${next}`, `Status: ${next}`);
  return { ok: true };
}

export async function rateJob(
  userId: string,
  kind: JobKind,
  jobId: string,
  rating: unknown,
  body: unknown,
) {
  const sql = await sqlOf();
  await limit(sql, userId, "rate");
  const score = cleanMoney(rating, 5, false);
  const text = cleanOptional(body, 500);
  await guardUserText(sql, userId, "reviews", text);
  const table = await tableOf(kind);
  const jobs = await sql.query<{ user_id: string; status: string; courier_id: string | null }>(
    `select user_id, status, courier_id from ${table} where id = $1`,
    [jobId],
  );
  const job = jobs[0];
  if (!job || job.user_id !== userId || job.status !== "delivered" || !job.courier_id)
    throw new MarketError("forbidden");
  await sql`
    insert into reviews (id, user_id, job_kind, job_id, target_user_id, rating, body)
    values (${crypto.randomUUID()}, ${userId}, ${kind}, ${jobId}, ${job.courier_id}, ${score}, ${text})
    on conflict (user_id, job_kind, job_id) where job_id is not null do update set rating = excluded.rating, body = excluded.body`;
  return { ok: true };
}

export async function markNotificationsRead(userId: string, ids: unknown) {
  const sql = await sqlOf();
  const list = Array.isArray(ids) ? ids.filter((id) => typeof id === "string").slice(0, 50) : [];
  if (!list.length) {
    await sql`update notifications set read_at = now() where user_id = ${userId} and read_at is null`;
  } else {
    await sql`update notifications set read_at = now() where user_id = ${userId} and id = any(${list}) and read_at is null`;
  }
  return { ok: true };
}

export async function adminComplianceScan(userId: string) {
  const sql = await sqlOf();
  const mine = await roles(sql, userId);
  if (!approved(mine, "admin")) throw new MarketError("forbidden");
  const { runComplianceScan } = await import("@/lib/compliance/service.server");
  return runComplianceScan(sql, userId);
}
