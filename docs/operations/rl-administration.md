# R&L administration

Use the existing /admin page with an authenticated, approved SUPER_ADMIN. The server, not the displayed editor, owns permission checks. No migration creates the first owner. Approve only an explicitly identified, verified existing operator account; never copy a session, password or OTP into SQL or a PR. Real phone authentication requires the existing provider credentials.

The operational editor selects a resource, lists 50 rows at a time, and edits strict JSON fields. Every save goes through the resource's domain schema. Unknown fields are refused; read-only IDs, credentials, timestamps and other-domain data cannot be supplied. Archive requires an explicit record selection and confirmation. The audit resource is read-only.

| Resource | Allowed operational fields |
|---|---|
| products | slug, category_id (existing six categories), name_ku, name_en, brand, description_ku, specs, image, status; compliance still enforced |
| offers | product_id, price_iqd, shipping_iqd, stock, contact, status; approved compliant product required |
| categories | Existing category identifier on creation; name_ku, name_en |
| reviews | Own product review on creation; rating, body, moderation status; no invented purchase badge |
| reports | subject/body on creation; open/closed status |
| orders | Own verified-contact buy/forward request on creation using the existing declaration/validation; staff status transitions only on update; work needs an accepted customer quote |
| delivery/transport | Existing pickup/dropoff/item or origin/destination/load fields, preferred_date, approved courier assignment and valid status progression; declaration required |
| tracking | shipment_id on creation, real bilingual title/place, phase, actual occurred_at, next_action, optional estimate_from/estimate_to; never create events that did not occur |
| users | Pending disabled phone/name profile on creation; name and disabled_at on update; activation of a pending profile requires delivered OTP verification |
| roles | Existing verified user_id, role and status; profile metadata; no public administrative grants |
| settings | ai.assistant.enabled (boolean), ai.assistant.daily_cap (integer 1–200), operations.note (text); policy never expands the configured deployment budget |
| audit | Immutable field-name-only administrative history, read-only |

A pending user archive cancels provisioning. Authentication on a disabled account is refused. Existing customer records and histories remain in the unified database. The final approved owner and immutable compliance controls cannot be deleted through CRUD.

If a save is refused, correct its field types/domain transition or reload the latest row after a concurrent update. Never work around auth, declarations, compliance, accepted quotes or audit failures. Legal/business information must be owner-verified in `src/lib/business-approved.json` and pass `npm run release:check` before release. Build validation uses `DATABASE_URL=''`; production migration is a separate controlled release action, never a test against customer data.
