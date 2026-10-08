import { a as cleanContact, c as cleanOptional, d as likePattern, f as offerTotal, h as slugify, i as cheapest, l as cleanStock, m as rankOffers, n as MarketError, o as cleanImage, p as pageWindow, r as canSetJobStatus, s as cleanMoney, u as cleanText } from "./api-B_xVp1SE.mjs";
import { r as getSql } from "./db-CjZOnVcA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/handlers.server-CdzKhNJ1.js
var PAGE = 8;
async function sqlOf() {
	return getSql();
}
async function ensureBuyer(sql, userId) {
	await sql`insert into user_roles (user_id, role, status) values (${userId}, 'buyer', 'approved') on conflict (user_id, role) do nothing`;
}
async function roles(sql, userId) {
	return sql`
    select role, status, display_name, city, phone from user_roles where user_id = ${userId}`;
}
function approved(rows, role) {
	return rows.some((row) => row.role === role && row.status === "approved");
}
async function limit(sql, userId, action) {
	const rows = await sql`
    select count(*) as n from action_log
    where user_id = ${userId} and action = ${action} and created_at > now() - interval '1 hour'`;
	if (Number(rows[0]?.n ?? 0) >= 20) throw new MarketError("rate");
	await sql`insert into action_log (id, user_id, action) values (${crypto.randomUUID()}, ${userId}, ${action})`;
}
async function notify(sql, userId, bodyKu, bodyEn) {
	await sql`insert into notifications (id, user_id, body_ku, body_en) values (${crypto.randomUUID()}, ${userId}, ${bodyKu}, ${bodyEn})`;
}
async function notifyAdmins(sql, bodyKu, bodyEn) {
	const admins = await sql`select user_id from user_roles where role = 'admin' and status = 'approved'`;
	for (const admin of admins) await notify(sql, admin.user_id, bodyKu, bodyEn);
}
function log(action, userId) {
	console.info("[market]", action, userId);
}
async function getMe(userId) {
	const sql = await sqlOf();
	await ensureBuyer(sql, userId);
	const mine = await roles(sql, userId);
	const notes = await sql`
    select id, body_ku, body_en, created_at from notifications
    where user_id = ${userId} and read_at is null order by created_at desc limit 12`;
	return {
		userId,
		roles: mine.map((row) => ({
			role: row.role,
			status: row.status,
			displayName: row.display_name,
			city: row.city,
			phone: row.phone
		})),
		notes: notes.map((note) => ({
			id: String(note.id),
			bodyKu: String(note.body_ku),
			bodyEn: String(note.body_en)
		}))
	};
}
async function requestRole(userId, input) {
	if (input.role !== "seller" && input.role !== "courier") throw new MarketError("invalid");
	const sql = await sqlOf();
	await ensureBuyer(sql, userId);
	await limit(sql, userId, "role");
	const name = cleanText(input.displayName, 80);
	const city = cleanText(input.city, 40);
	const phone = cleanOptional(input.phone, 30);
	await sql`
    insert into user_roles (user_id, role, status, display_name, city, phone)
    values (${userId}, ${input.role}, 'pending', ${name}, ${city}, ${phone})
    on conflict (user_id, role) do update set
      display_name = excluded.display_name,
      city = excluded.city,
      phone = excluded.phone,
      status = case when user_roles.status = 'approved' then 'approved' else 'pending' end`;
	await notifyAdmins(sql, "داواکاریی ڕۆڵی نوێ", "New role request");
	log("role", userId);
	return { ok: true };
}
async function listProducts(input) {
	const sql = await sqlOf();
	const q = typeof input.q === "string" ? input.q.trim().slice(0, 80) : "";
	const category = typeof input.category === "string" ? input.category : "";
	const brand = typeof input.brand === "string" ? input.brand : "";
	const min = input.min === "" || input.min == null ? null : cleanMoney(input.min, 5e7, true);
	const max = input.max === "" || input.max == null ? null : cleanMoney(input.max, 5e7, true);
	const stock = input.stock === "in" ? "in" : "";
	const sort = input.sort === "new" ? "new" : "price";
	const page = pageWindow(input.page);
	const saved = input.saved === true || input.saved === "1";
	const pattern = q ? likePattern(q) : null;
	const offset = (page - 1) * PAGE;
	const rows = await sql`
    with live as (
      select o.product_id,
             min(o.price_iqd + o.shipping_iqd) filter (where o.stock <> 'out') as lowest,
             count(*)::int as offer_count,
             bool_or(o.stock <> 'out') as available
      from offers o
      join user_roles r on r.user_id = o.seller_id and r.role = 'seller' and r.status = 'approved'
      where o.status = 'approved'
      group by o.product_id
    )
    select p.slug, p.name_ku, p.name_en, p.brand, p.image, p.category_id, p.created_at,
           c.name_ku as category_ku, c.name_en as category_en,
           l.lowest, l.offer_count, l.available,
           count(*) over()::int as total_count
    from products p
    join categories c on c.id = p.category_id
    left join live l on l.product_id = p.id
    where p.status = 'approved'
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
	const brands = await sql`select distinct brand from products where status = 'approved' order by brand`;
	const cats = await sql`select id, name_ku, name_en from categories order by name_en`;
	const total = Number(rows[0]?.total_count ?? 0);
	return {
		items: rows.map((row) => ({
			slug: String(row.slug),
			nameKu: String(row.name_ku),
			nameEn: String(row.name_en),
			brand: String(row.brand),
			image: row.image ? String(row.image) : null,
			categoryId: String(row.category_id),
			lowest: row.lowest == null ? null : Number(row.lowest),
			offerCount: Number(row.offer_count ?? 0)
		})),
		page,
		pages: Math.max(1, Math.ceil(total / PAGE)),
		brands: brands.map((row) => row.brand),
		categories: cats
	};
}
async function getProduct(slug, userId) {
	const sql = await sqlOf();
	const product = (await sql`
    select p.*, c.name_ku as category_ku, c.name_en as category_en
    from products p join categories c on c.id = p.category_id
    where p.slug = ${slug} and p.status = 'approved'`)[0];
	if (!product) throw new MarketError("notfound");
	const raw = await sql`
    select o.id, o.price_iqd, o.shipping_iqd, o.stock, o.contact, o.seller_id, o.updated_at,
           coalesce(r.display_name, o.seller_id) as seller_name, r.city
    from offers o
    join user_roles r on r.user_id = o.seller_id and r.role = 'seller' and r.status = 'approved'
    where o.product_id = ${product.id} and o.status = 'approved'`;
	const offers = rankOffers(raw.map((row) => ({
		id: String(row.id),
		price: Number(row.price_iqd),
		shipping: Number(row.shipping_iqd),
		stock: row.stock,
		contact: String(row.contact),
		sellerId: String(row.seller_id),
		sellerName: String(row.seller_name),
		city: row.city ? String(row.city) : "",
		total: 0
	})));
	const best = cheapest(offers);
	const history = best ? await sql`
        select price_iqd, shipping_iqd, recorded_at from price_history where offer_id = ${best.id} order by recorded_at` : [];
	const reviewRows = await sql`
    select rating, body, created_at from reviews where product_id = ${product.id} order by created_at desc limit 12`;
	let favorite = false;
	let alert = null;
	if (userId) {
		favorite = (await sql`select 1 as ok from favorites where user_id = ${userId} and product_id = ${product.id}`).length > 0;
		const alerts = await sql`select target_iqd from price_alerts where user_id = ${userId} and product_id = ${product.id}`;
		alert = alerts[0] ? Number(alerts[0].target_iqd) : null;
	}
	const avg = reviewRows.length ? reviewRows.reduce((sum, row) => sum + Number(row.rating), 0) / reviewRows.length : null;
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
			at: String(point.recorded_at)
		})),
		reviews: reviewRows.map((row) => ({
			rating: Number(row.rating),
			body: row.body,
			at: String(row.created_at)
		})),
		avg,
		favorite,
		alert
	};
}
async function checkAlerts(sql, productId) {
	const live = await sql`
    select min(o.price_iqd + o.shipping_iqd) as total
    from offers o
    join user_roles r on r.user_id = o.seller_id and r.role = 'seller' and r.status = 'approved'
    where o.product_id = ${productId} and o.status = 'approved' and o.stock <> 'out'`;
	const lowest = live[0]?.total == null ? null : Number(live[0].total);
	if (lowest == null) return;
	const hits = await sql`
    select user_id, target_iqd from price_alerts where product_id = ${productId} and target_iqd >= ${lowest}`;
	for (const hit of hits) await notify(sql, hit.user_id, `نرخ کەوتە ژێر ${hit.target_iqd}`, `A price fell under ${hit.target_iqd}`);
}
async function saveProduct(userId, input) {
	const sql = await sqlOf();
	if (!approved(await roles(sql, userId), "seller")) throw new MarketError("forbidden");
	await limit(sql, userId, "product");
	const nameKu = cleanText(input.nameKu, 80);
	const nameEn = cleanText(input.nameEn, 80);
	const brand = cleanText(input.brand, 40);
	const category = cleanText(input.category, 40);
	const description = cleanOptional(input.description, 1e3);
	const specs = cleanOptional(input.specs, 300);
	const image = cleanImage(input.image);
	const price = cleanMoney(input.price, 5e7, false);
	const shipping = cleanMoney(input.shipping ?? 0, 5e6, true);
	const stock = cleanStock(input.stock);
	const contact = cleanContact(input.contact);
	if (!(await sql`select id from categories where id = ${category}`).length) throw new MarketError("invalid");
	const id = crypto.randomUUID();
	const slug = slugify(nameEn);
	const offerId = crypto.randomUUID();
	await sql`
    insert into products (id, slug, owner_id, category_id, name_ku, name_en, description_ku, brand, specs, image, status)
    values (${id}, ${slug}, ${userId}, ${category}, ${nameKu}, ${nameEn}, ${description}, ${brand}, ${specs}, ${image}, 'pending')`;
	await sql`
    insert into offers (id, product_id, seller_id, price_iqd, shipping_iqd, stock, contact, status)
    values (${offerId}, ${id}, ${userId}, ${price}, ${shipping}, ${stock}, ${contact}, 'pending')`;
	await sql`
    insert into price_history (id, offer_id, price_iqd, shipping_iqd) values (${crypto.randomUUID()}, ${offerId}, ${price}, ${shipping})`;
	await notifyAdmins(sql, "کاڵای نوێ چاوەڕوانی پەسەندە", "A new product is waiting");
	log("product", userId);
	return { slug };
}
async function saveOffer(userId, input) {
	const sql = await sqlOf();
	if (!approved(await roles(sql, userId), "seller")) throw new MarketError("forbidden");
	await limit(sql, userId, "offer");
	const slug = cleanText(input.slug, 80);
	const price = cleanMoney(input.price, 5e7, false);
	const shipping = cleanMoney(input.shipping ?? 0, 5e6, true);
	const stock = cleanStock(input.stock);
	const contact = cleanContact(input.contact);
	const product = (await sql`select id, status from products where slug = ${slug} and status <> 'removed'`)[0];
	if (!product) throw new MarketError("notfound");
	const existing = await sql`
    select id, price_iqd, shipping_iqd, status from offers where product_id = ${product.id} and seller_id = ${userId}`;
	if (!existing[0]) {
		const offerId = crypto.randomUUID();
		await sql`
      insert into offers (id, product_id, seller_id, price_iqd, shipping_iqd, stock, contact, status)
      values (${offerId}, ${product.id}, ${userId}, ${price}, ${shipping}, ${stock}, ${contact}, 'pending')`;
		await sql`insert into price_history (id, offer_id, price_iqd, shipping_iqd) values (${crypto.randomUUID()}, ${offerId}, ${price}, ${shipping})`;
		await notifyAdmins(sql, "ئۆفەری نوێ چاوەڕوانی پەسەندە", "A new offer is waiting");
	} else {
		const offer = existing[0];
		if (offer.status === "removed") throw new MarketError("forbidden");
		await sql`
      update offers set price_iqd = ${price}, shipping_iqd = ${shipping}, stock = ${stock}, contact = ${contact}, updated_at = now()
      where id = ${offer.id}`;
		if (Number(offer.price_iqd) !== price || Number(offer.shipping_iqd) !== shipping) {
			await sql`insert into price_history (id, offer_id, price_iqd, shipping_iqd) values (${crypto.randomUUID()}, ${offer.id}, ${price}, ${shipping})`;
			if (offer.status === "approved" && product.status === "approved") await checkAlerts(sql, product.id);
		}
	}
	log("offer", userId);
	return { ok: true };
}
async function myOffers(userId) {
	return (await (await sqlOf())`
    select p.slug, p.name_ku, p.name_en, p.status as product_status, o.price_iqd, o.shipping_iqd, o.stock, o.status as offer_status, o.contact
    from offers o join products p on p.id = o.product_id
    where o.seller_id = ${userId}
    order by o.updated_at desc`).map((row) => ({
		slug: String(row.slug),
		nameKu: String(row.name_ku),
		nameEn: String(row.name_en),
		productStatus: String(row.product_status),
		offerStatus: String(row.offer_status),
		price: Number(row.price_iqd),
		shipping: Number(row.shipping_iqd),
		stock: String(row.stock),
		contact: String(row.contact)
	}));
}
async function setFavorite(userId, slug, on) {
	const sql = await sqlOf();
	await ensureBuyer(sql, userId);
	const products = await sql`select id from products where slug = ${slug} and status = 'approved'`;
	if (!products[0]) throw new MarketError("notfound");
	if (on) await sql`insert into favorites (user_id, product_id) values (${userId}, ${products[0].id}) on conflict do nothing`;
	else await sql`delete from favorites where user_id = ${userId} and product_id = ${products[0].id}`;
	return { ok: true };
}
async function setAlert(userId, slug, target) {
	const sql = await sqlOf();
	await ensureBuyer(sql, userId);
	await limit(sql, userId, "alert");
	const money = cleanMoney(target, 5e7, false);
	const products = await sql`select id from products where slug = ${slug} and status = 'approved'`;
	if (!products[0]) throw new MarketError("notfound");
	await sql`
    insert into price_alerts (id, user_id, product_id, target_iqd)
    values (${crypto.randomUUID()}, ${userId}, ${products[0].id}, ${money})
    on conflict (user_id, product_id) do update set target_iqd = excluded.target_iqd`;
	await checkAlerts(sql, products[0].id);
	return { ok: true };
}
async function addReview(userId, slug, rating, body) {
	const sql = await sqlOf();
	await ensureBuyer(sql, userId);
	await limit(sql, userId, "review");
	const score = cleanMoney(rating, 5, false);
	const text = cleanOptional(body, 500);
	const products = await sql`select id from products where slug = ${slug} and status = 'approved'`;
	if (!products[0]) throw new MarketError("notfound");
	await sql`
    insert into reviews (id, user_id, product_id, rating, body)
    values (${crypto.randomUUID()}, ${userId}, ${products[0].id}, ${score}, ${text})
    on conflict (user_id, product_id) where product_id is not null do update set rating = excluded.rating, body = excluded.body`;
	return { ok: true };
}
async function reportProblem(userId, subject, body) {
	const sql = await sqlOf();
	await ensureBuyer(sql, userId);
	await limit(sql, userId, "report");
	const title = cleanText(subject, 80);
	const text = cleanText(body, 1e3);
	await sql`insert into reports (id, user_id, subject, body) values (${crypto.randomUUID()}, ${userId}, ${title}, ${text})`;
	await notifyAdmins(sql, "سکاڵایەکی نوێ", "A new report");
	log("report", userId);
	return { ok: true };
}
async function adminQueue(userId) {
	const sql = await sqlOf();
	if (!approved(await roles(sql, userId), "admin")) throw new MarketError("forbidden");
	const [pendingRoles, pendingProducts, pendingOffers, openReports] = await Promise.all([
		sql`select user_id, role, display_name, city, phone from user_roles where status = 'pending' order by created_at`,
		sql`select slug, name_ku, name_en, brand, owner_id from products where status = 'pending' order by created_at`,
		sql`select o.id, p.slug, p.name_ku, o.seller_id, o.price_iqd, o.shipping_iqd from offers o join products p on p.id = o.product_id where o.status = 'pending' order by o.created_at`,
		sql`select id, subject, body, created_at from reports order by created_at desc limit 20`
	]);
	return {
		pendingRoles: pendingRoles.map((row) => ({
			userId: String(row.user_id),
			role: String(row.role),
			displayName: row.display_name ? String(row.display_name) : String(row.user_id),
			city: row.city ? String(row.city) : ""
		})),
		pendingProducts: pendingProducts.map((row) => ({
			slug: String(row.slug),
			nameKu: String(row.name_ku),
			nameEn: String(row.name_en),
			brand: String(row.brand)
		})),
		pendingOffers: pendingOffers.map((row) => ({
			id: String(row.id),
			slug: String(row.slug),
			nameKu: String(row.name_ku),
			price: Number(row.price_iqd),
			shipping: Number(row.shipping_iqd)
		})),
		openReports: openReports.map((row) => ({
			id: String(row.id),
			subject: String(row.subject),
			body: String(row.body)
		}))
	};
}
async function adminSet(userId, input) {
	const sql = await sqlOf();
	if (!approved(await roles(sql, userId), "admin")) throw new MarketError("forbidden");
	const id = cleanText(input.id, 80);
	const status = input.status === "approved" || input.status === "removed" ? input.status : null;
	if (!status) throw new MarketError("invalid");
	if (input.kind === "role") {
		await sql`update user_roles set status = ${status} where user_id = ${id} and role = ${cleanText(input.role, 20)}`;
		await notify(sql, id, status === "approved" ? "ڕۆڵەکەت پەسەند کرا" : "ڕۆڵەکەت لابرا", status === "approved" ? "Your role was approved" : "Your role was removed");
	} else if (input.kind === "product") await sql`update products set status = ${status} where slug = ${id}`;
	else if (input.kind === "offer") {
		await sql`update offers set status = ${status} where id = ${id}`;
		const rows = await sql`select product_id from offers where id = ${id}`;
		if (rows[0] && status === "approved") await checkAlerts(sql, rows[0].product_id);
	} else throw new MarketError("invalid");
	log("admin", userId);
	return { ok: true };
}
async function tableOf(kind) {
	if (kind !== "delivery" && kind !== "transport") throw new MarketError("invalid");
	return kind === "delivery" ? "delivery_requests" : "transport_requests";
}
async function createDelivery(userId, input) {
	const sql = await sqlOf();
	await ensureBuyer(sql, userId);
	await limit(sql, userId, "delivery");
	const id = crypto.randomUUID();
	const pickup = cleanText(input.pickup, 200);
	const dropoff = cleanText(input.dropoff, 200);
	const item = cleanText(input.item, 300);
	const size = cleanOptional(input.size, 80);
	const date = cleanOptional(input.date, 20);
	await sql`
    insert into delivery_requests (id, user_id, product_slug, pickup, dropoff, item_desc, size_note, preferred_date)
    values (${id}, ${userId}, ${input.product ? cleanText(input.product, 80) : null}, ${pickup}, ${dropoff}, ${item}, ${size}, ${date})`;
	await sql`insert into job_status (id, job_kind, job_id, status, actor_id) values (${crypto.randomUUID()}, 'delivery', ${id}, 'requested', ${userId})`;
	log("delivery", userId);
	return { id };
}
async function createTransport(userId, input) {
	const sql = await sqlOf();
	await ensureBuyer(sql, userId);
	await limit(sql, userId, "transport");
	const id = crypto.randomUUID();
	await sql`
    insert into transport_requests (id, user_id, origin, destination, load_desc, preferred_date)
    values (${id}, ${userId}, ${cleanText(input.origin, 200)}, ${cleanText(input.destination, 200)}, ${cleanText(input.load, 300)}, ${cleanOptional(input.date, 20)})`;
	await sql`insert into job_status (id, job_kind, job_id, status, actor_id) values (${crypto.randomUUID()}, 'transport', ${id}, 'requested', ${userId})`;
	log("transport", userId);
	return { id };
}
async function listJobs(userId) {
	const sql = await sqlOf();
	const courier = approved(await roles(sql, userId), "courier");
	const deliveries = await sql`
    select id, user_id, product_slug, pickup, dropoff, item_desc, size_note, preferred_date, status, courier_id, created_at
    from delivery_requests where user_id = ${userId} or courier_id = ${userId} order by created_at desc limit 30`;
	const transports = await sql`
    select id, user_id, origin, destination, load_desc, preferred_date, status, courier_id, created_at
    from transport_requests where user_id = ${userId} or courier_id = ${userId} order by created_at desc limit 30`;
	const openDeliveries = courier ? await sql`select id, pickup, dropoff, item_desc, size_note, preferred_date, created_at from delivery_requests where status = 'requested' and user_id <> ${userId} order by created_at desc limit 30` : [];
	const openTransports = courier ? await sql`select id, origin, destination, load_desc, preferred_date, created_at from transport_requests where status = 'requested' and user_id <> ${userId} order by created_at desc limit 30` : [];
	const bids = await sql`
    select j.job_kind, j.job_id, j.courier_id, j.note, j.status, coalesce(r.display_name, j.courier_id) as name
    from job_offers j
    left join user_roles r on r.user_id = j.courier_id and r.role = 'courier'
    where j.job_id in (
      select id from delivery_requests where user_id = ${userId}
      union select id from transport_requests where user_id = ${userId}
    )`;
	const mapDelivery = (row) => ({
		id: String(row.id),
		userId: String(row.user_id),
		pickup: String(row.pickup),
		dropoff: String(row.dropoff),
		item: String(row.item_desc),
		status: String(row.status),
		courierId: row.courier_id ? String(row.courier_id) : null
	});
	const mapTransport = (row) => ({
		id: String(row.id),
		userId: String(row.user_id),
		origin: String(row.origin),
		destination: String(row.destination),
		load: String(row.load_desc),
		status: String(row.status),
		courierId: row.courier_id ? String(row.courier_id) : null
	});
	return {
		courier,
		deliveries: deliveries.map(mapDelivery),
		transports: transports.map(mapTransport),
		openDeliveries: openDeliveries.map((row) => ({
			id: String(row.id),
			pickup: String(row.pickup),
			dropoff: String(row.dropoff),
			item: String(row.item_desc)
		})),
		openTransports: openTransports.map((row) => ({
			id: String(row.id),
			origin: String(row.origin),
			destination: String(row.destination),
			load: String(row.load_desc)
		})),
		bids: bids.map((row) => ({
			kind: String(row.job_kind),
			jobId: String(row.job_id),
			courierId: String(row.courier_id),
			name: String(row.name),
			status: String(row.status)
		}))
	};
}
async function offerJob(userId, kind, jobId, note) {
	const sql = await sqlOf();
	if (!approved(await roles(sql, userId), "courier")) throw new MarketError("forbidden");
	await limit(sql, userId, "bid");
	const text = cleanOptional(note, 200);
	const table = await tableOf(kind);
	const job = (await sql.query(`select user_id, status from ${table} where id = $1`, [jobId]))[0];
	if (!job || job.status !== "requested") throw new MarketError("notfound");
	if (job.user_id === userId) throw new MarketError("forbidden");
	await sql`
    insert into job_offers (id, job_kind, job_id, courier_id, note)
    values (${crypto.randomUUID()}, ${kind}, ${jobId}, ${userId}, ${text})
    on conflict (job_kind, job_id, courier_id) do update set note = excluded.note`;
	await notify(sql, job.user_id, "شۆفێرێک ئامادەیە", "A driver offered to take the job");
	return { ok: true };
}
async function chooseCourier(userId, kind, jobId, courierId) {
	const sql = await sqlOf();
	const table = await tableOf(kind);
	const job = (await sql.query(`select user_id, status from ${table} where id = $1`, [jobId]))[0];
	if (!job || job.user_id !== userId || job.status !== "requested") throw new MarketError("forbidden");
	if (!(await sql`
    select courier_id from job_offers where job_kind = ${kind} and job_id = ${jobId} and courier_id = ${courierId} and status = 'offered'`)[0]) throw new MarketError("notfound");
	await sql.query(`update ${table} set status = 'accepted', courier_id = $1 where id = $2`, [courierId, jobId]);
	await sql`update job_offers set status = 'declined' where job_kind = ${kind} and job_id = ${jobId}`;
	await sql`update job_offers set status = 'chosen' where job_kind = ${kind} and job_id = ${jobId} and courier_id = ${courierId}`;
	await sql`insert into job_status (id, job_kind, job_id, status, actor_id) values (${crypto.randomUUID()}, ${kind}, ${jobId}, 'accepted', ${userId})`;
	await notify(sql, courierId, "کارەکەت هەڵبژێردرا", "You were chosen for a job");
	return { ok: true };
}
async function setJobStatus(userId, kind, jobId, next) {
	const sql = await sqlOf();
	const table = await tableOf(kind);
	const job = (await sql.query(`select user_id, status, courier_id from ${table} where id = $1`, [jobId]))[0];
	if (!job) throw new MarketError("notfound");
	const who = job.user_id === userId ? "requester" : job.courier_id === userId ? "courier" : null;
	if (!who || !canSetJobStatus(job.status, next, who)) throw new MarketError("forbidden");
	await sql.query(`update ${table} set status = $1 where id = $2`, [next, jobId]);
	await sql`insert into job_status (id, job_kind, job_id, status, actor_id) values (${crypto.randomUUID()}, ${kind}, ${jobId}, ${next}, ${userId})`;
	const other = who === "requester" ? job.courier_id : job.user_id;
	if (other) await notify(sql, other, `دۆخ: ${next}`, `Status: ${next}`);
	return { ok: true };
}
async function rateJob(userId, kind, jobId, rating, body) {
	const sql = await sqlOf();
	await limit(sql, userId, "rate");
	const score = cleanMoney(rating, 5, false);
	const text = cleanOptional(body, 500);
	const table = await tableOf(kind);
	const job = (await sql.query(`select user_id, status, courier_id from ${table} where id = $1`, [jobId]))[0];
	if (!job || job.user_id !== userId || job.status !== "delivered" || !job.courier_id) throw new MarketError("forbidden");
	await sql`
    insert into reviews (id, user_id, job_kind, job_id, target_user_id, rating, body)
    values (${crypto.randomUUID()}, ${userId}, ${kind}, ${jobId}, ${job.courier_id}, ${score}, ${text})
    on conflict (user_id, job_kind, job_id) where job_id is not null do update set rating = excluded.rating, body = excluded.body`;
	return { ok: true };
}
//#endregion
export { addReview, adminQueue, adminSet, chooseCourier, createDelivery, createTransport, getMe, getProduct, listJobs, listProducts, myOffers, offerJob, rateJob, reportProblem, requestRole, saveOffer, saveProduct, setAlert, setFavorite, setJobStatus };
