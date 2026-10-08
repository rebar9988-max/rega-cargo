import { c as setCookie$1, o as getCookie, s as getRequest } from "./ssr.mjs";
import { i as toE164, n as cleanPin } from "./format-BNUSC0Sf.mjs";
import { r as getSql } from "./db-CjZOnVcA.mjs";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/session.server-BU8_0BkD.js
function env(name) {
	const value = process.env[name]?.trim();
	return value ? value : void 0;
}
function text(code) {
	return `R&L: کۆدەکەت ${code} ـە. بە کەسێکی مەیدە. Your code is ${code}.`;
}
async function post(url, init) {
	const response = await fetch(url, {
		...init,
		signal: AbortSignal.timeout(8e3)
	});
	if (!response.ok) {
		console.error("[phone] send failed", response.status, url.split("?")[0]);
		return false;
	}
	return true;
}
async function sendWhatsApp(phone, code) {
	const token = env("WHATSAPP_TOKEN");
	const phoneId = env("WHATSAPP_PHONE_ID");
	if (!token || !phoneId) return false;
	const template = env("WHATSAPP_TEMPLATE");
	const body = template ? {
		messaging_product: "whatsapp",
		to: phone.replace("+", ""),
		type: "template",
		template: {
			name: template,
			language: { code: env("WHATSAPP_TEMPLATE_LANG") ?? "en" },
			components: [{
				type: "body",
				parameters: [{
					type: "text",
					text: code
				}]
			}]
		}
	} : {
		messaging_product: "whatsapp",
		to: phone.replace("+", ""),
		type: "text",
		text: { body: text(code) }
	};
	try {
		return await post(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(body)
		});
	} catch (err) {
		console.error("[phone] whatsapp", err instanceof Error ? err.message : "failed");
		return false;
	}
}
async function sendSms(phone, code) {
	const sid = env("TWILIO_ACCOUNT_SID");
	const token = env("TWILIO_AUTH_TOKEN");
	const from = env("TWILIO_FROM");
	if (!sid || !token || !from) return false;
	const form = new URLSearchParams({
		To: phone,
		From: from,
		Body: text(code)
	});
	try {
		return await post(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
			method: "POST",
			headers: {
				Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: form
		});
	} catch (err) {
		console.error("[phone] sms", err instanceof Error ? err.message : "failed");
		return false;
	}
}
async function deliverCode(phone, code) {
	const [whatsapp, sms] = await Promise.all([sendWhatsApp(phone, code), sendSms(phone, code)]);
	return {
		whatsapp,
		sms
	};
}
var COOKIE = "rl_phone";
var MONTH = 2592e3;
function sha(value) {
	return createHash("sha256").update(value).digest("hex");
}
function hashPin(pin, salt) {
	return scryptSync(pin, salt, 32).toString("hex");
}
function pinsMatch(pin, salt, expected) {
	const actual = Buffer.from(hashPin(pin, salt), "hex");
	const stored = Buffer.from(expected, "hex");
	return actual.length === stored.length && timingSafeEqual(actual, stored);
}
function secureCookie() {
	const request = getRequest();
	const proto = request?.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
	if (proto) return proto === "https";
	return request?.url.startsWith("https:") ?? false;
}
function writeCookie(token) {
	setCookie$1(COOKIE, token ?? "", {
		path: "/",
		httpOnly: true,
		secure: secureCookie(),
		sameSite: "lax",
		maxAge: token ? MONTH : 0
	});
}
async function limited(key) {
	const sql = await getSql();
	const rows = await sql`
    select count(*) as n from action_log
    where user_id = ${key} and action = 'phone' and created_at > now() - interval '1 hour'`;
	if (Number(rows[0]?.n ?? 0) >= 8) return true;
	await sql`insert into action_log (id, user_id, action) values (${crypto.randomUUID()}, ${key}, 'phone')`;
	return false;
}
async function currentPhoneUserId() {
	const token = getCookie(COOKIE);
	if (!token) return null;
	return (await (await getSql())`
    select user_id from phone_sessions where token_hash = ${sha(token)} and expires_at > now()`)[0]?.user_id ?? null;
}
async function phoneMe() {
	const id = await currentPhoneUserId();
	if (!id) return null;
	const rows = await (await getSql())`select name, phone from phone_users where id = ${id}`;
	return rows[0] ? {
		name: rows[0].name,
		phone: rows[0].phone
	} : null;
}
async function phoneStart(dial, national) {
	const phone = toE164(String(dial ?? ""), String(national ?? ""));
	if (!phone) return { error: "phone" };
	if (await limited(`look:${phone}`)) return { error: "rate" };
	const sql = await getSql();
	const rows = await sql`select id from phone_users where phone = ${phone}`;
	const code = String(Math.floor(1e3 + Math.random() * 9e3));
	const sent = await deliverCode(phone, code);
	if (!sent.whatsapp && !sent.sms) return {
		phone,
		exists: rows.length > 0,
		sent: false,
		whatsapp: false,
		sms: false
	};
	const salt = randomBytes(16).toString("hex");
	await sql`
    insert into phone_codes (phone, code_hash, code_salt, expires_at, attempts)
    values (${phone}, ${hashPin(code, salt)}, ${salt}, now() + interval '10 minutes', 0)
    on conflict (phone) do update set code_hash = excluded.code_hash, code_salt = excluded.code_salt, expires_at = excluded.expires_at, attempts = 0`;
	return {
		phone,
		exists: rows.length > 0,
		sent: true,
		whatsapp: sent.whatsapp,
		sms: sent.sms
	};
}
async function phoneConfirm(input) {
	const phone = toE164(String(input.dial ?? ""), String(input.national ?? ""));
	const pin = cleanPin(String(input.pin ?? ""));
	if (!phone || !pin) return { error: "invalid" };
	if (await limited(`pin:${phone}`)) return { error: "rate" };
	const sql = await getSql();
	const row = (await sql`
    select code_hash, code_salt, attempts from phone_codes where phone = ${phone} and expires_at > now()`)[0];
	if (!row || Number(row.attempts) >= 5 || !pinsMatch(pin, row.code_salt, row.code_hash)) {
		await sql`update phone_codes set attempts = attempts + 1 where phone = ${phone}`;
		return { error: "wrong" };
	}
	await sql`delete from phone_codes where phone = ${phone}`;
	const users = await sql`select id, name from phone_users where phone = ${phone}`;
	if (users[0]) {
		await openSession(users[0].id);
		return {
			name: users[0].name,
			phone
		};
	}
	const name = String(input.name ?? "").trim().replace(/\s+/g, " ");
	if (name.length < 2 || name.length > 40) return { error: "invalid" };
	const id = `ph_${crypto.randomUUID()}`;
	const salt = randomBytes(16).toString("hex");
	await sql`
    insert into phone_users (id, phone, name, pin_hash, pin_salt)
    values (${id}, ${phone}, ${name}, ${hashPin(randomBytes(8).toString("hex"), salt)}, ${salt})`;
	await sql`
    insert into user_roles (user_id, role, status, display_name, phone)
    values (${id}, 'buyer', 'approved', ${name}, ${phone})
    on conflict (user_id, role) do nothing`;
	await openSession(id);
	return {
		name,
		phone
	};
}
async function openSession(userId) {
	const token = randomBytes(32).toString("hex");
	await (await getSql())`
    insert into phone_sessions (token_hash, user_id, expires_at)
    values (${sha(token)}, ${userId}, now() + interval '30 days')`;
	writeCookie(token);
}
async function phoneRegister(input) {
	const phone = toE164(String(input.dial ?? ""), String(input.national ?? ""));
	const pin = cleanPin(String(input.pin ?? ""));
	const name = String(input.name ?? "").trim().replace(/\s+/g, " ");
	if (!phone || !pin || name.length < 2 || name.length > 40) return { error: "invalid" };
	if (await limited(`reg:${phone}`)) return { error: "rate" };
	const sql = await getSql();
	if ((await sql`select id from phone_users where phone = ${phone}`).length) return { error: "exists" };
	const id = `ph_${crypto.randomUUID()}`;
	const salt = randomBytes(16).toString("hex");
	await sql`
    insert into phone_users (id, phone, name, pin_hash, pin_salt)
    values (${id}, ${phone}, ${name}, ${hashPin(pin, salt)}, ${salt})`;
	await sql`
    insert into user_roles (user_id, role, status, display_name, phone)
    values (${id}, 'buyer', 'approved', ${name}, ${phone})
    on conflict (user_id, role) do nothing`;
	await openSession(id);
	return {
		name,
		phone
	};
}
async function phoneLogin(input) {
	const phone = toE164(String(input.dial ?? ""), String(input.national ?? ""));
	const pin = cleanPin(String(input.pin ?? ""));
	if (!phone || !pin) return { error: "invalid" };
	if (await limited(`pin:${phone}`)) return { error: "rate" };
	const user = (await (await getSql())`
    select id, name, pin_hash, pin_salt from phone_users where phone = ${phone}`)[0];
	if (!user || !pinsMatch(pin, user.pin_salt, user.pin_hash)) return { error: "wrong" };
	await openSession(user.id);
	return {
		name: user.name,
		phone
	};
}
async function phoneLogout() {
	const token = getCookie(COOKIE);
	if (token) await (await getSql())`delete from phone_sessions where token_hash = ${sha(token)}`;
	writeCookie(null);
	return { ok: true };
}
//#endregion
export { currentPhoneUserId, phoneConfirm, phoneLogin, phoneLogout, phoneMe, phoneRegister, phoneStart };
