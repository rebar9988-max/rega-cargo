# First R&L owner activation

`/owner` is the invitation and later email/password sign-in entry; `/admin` remains the existing administrative dashboard. Existing phone authentication and the five product modules are preserved. No public email registration, role-promotion, email-change or account-linking endpoint is exposed.

## Independent authorization and invitation

An authorized operator must first verify platform control independently of email: authenticate to the repository provider, confirm the actor is the repository owner with administrative permission, and match the production Cloudflare build connection to that exact repository and owner ID. Record the evidence and the owner's explicit recipient designation. A verified email, a claimed username, repository display metadata or a client-supplied role is insufficient.

Only that operator's authenticated control-plane database connection may create the singleton `owner_bootstrap` record. Never create it through a public endpoint or the generic administrative resource registry. Before issuing anything, inspect existing identity records, approved owners and bootstrap state. Never replace an existing user's password or identity; never reopen a consumed bootstrap.

Generate a fresh cryptographically random 32-byte hex nonce; store only its SHA-256 hash with the normalized approved recipient, independent approver ID, ownership evidence and a short expiry. Insert an immutable `platform_audit_log` authorization entry in the same transaction. Deliver `https://www.rlgo.net/owner#invite=<nonce>` only to that approved mailbox through an existing authorized mail channel. Keep the nonce/link out of source, documentation, logs and chat. Do not open the recipient's verification link on their behalf.

For an expired, unconsumed invitation, an independently authorized operator may rotate the hash/expiry and append a distinct immutable audit entry. There is no public resend or self-approval endpoint. Successful activation permanently closes the singleton; normal SQL updates/deletes cannot reopen it.

## Recipient action and security

The recipient opens their time-limited link, then explicitly submits their own password. A new account needs 16–128 characters; an existing account must authenticate with its current password. Better Auth owns password hashing, sessions and secure host cookies. The nonce stays in page memory and is removed from browser history; it is never put in local/session storage. Loading/scanning the link alone grants nothing.

After successful credential authentication, a database transaction rechecks expiry, the exact nonce hash, the independently approved recipient, the authenticated identity and absence of an existing approved owner. It marks that email verified, grants `super_admin`, consumes/disables the bootstrap and writes the immutable activation audit together. Any failure rolls all four changes back. An account left after a later failed activation stays unprivileged and can retry using its existing password; it is never overwritten.

Private server operations read the current verified/non-disabled email identity and current database roles. Session cookie caching is disabled; browser role claims never grant authority. The existing last-owner and audit immutability protections remain in force. Invitations and sign-in are subject to the existing fail-closed rate limit and same-origin checks.

## Verification and recovery

The operator may verify pending/consumed state and immutable audit metadata using read-only control-plane queries. Do not mark email verified, create the owner's password, fabricate a session, or test real positive production login on the owner's behalf. Final production access verification requires the actual owner to activate and sign in. A lost password after activation requires an authorized recovery procedure using the current authentication system; this bootstrap must remain closed. Ongoing automated email delivery/password-reset services are not introduced by this one-time setup.
