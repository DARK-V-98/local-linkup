# System audit — 22 October 2026

## Implemented

- Removed browser-only registration and business-record success paths. Authentication is restored from Firebase, not a localStorage role. Missing profiles are created conservatively; failed registrations roll back the new Auth account when the profile write fails.
- Eight-character minimum passwords, normalized contact details, verification email send/resend, real password reauthentication, guarded internal redirects, suspension checks and live profile updates. Owner privileges require a verified Firebase Auth email, not a matching editable profile email.
- Seller registration now preserves fields across steps, uploads private identity documents, and persists a verification application. Sellers can retry or resubmit pending/rejected applications. Admin decisions and notes persist atomically with verification flags. Rejection does not silently suspend a user.
- Bookings use a stable document ID and only navigate to confirmation after the database write succeeds. All order surfaces use scoped database listeners. Seller status changes follow a validated lifecycle; buyers cannot rewrite amounts, parties or completion status.
- Saved services, reviews, feed likes/comments, job quotes, messaging and support enquiries persist in Firestore. Reviews require one completed owned booking. Messages and conversation updates are atomic. Buyer/seller dispute replies are visible on the booking page.
- Contact, overseas, urgent-service, newsletter and account-deletion requests enter an admin queue. Request submission is not represented as actual dispatch, email delivery, deletion, a refund or a bank transfer.
- Admin settings persist and registration switches are enforced by rules. Platform branding/contact links read saved settings. Placeholder support phone numbers and fabricated saved-seller suggestions were removed.
- Replaced the demo wallet and simulated top-ups with read-only financial records. PayHere checkout hashes are generated on the server from canonical booking prices. Only signed, amount-matched provider notifications mark online payments paid; browser callbacks never do. Cash must be recorded by the seller after service completion.
- Seller payout requests reserve cleared funds in a transaction and use idempotency keys. Only verified sellers with sufficient balance can request payouts. Live online funds release after buyer approval of completed work; test payments and cash never create platform payout funds. Open disputes and reversal flags block payouts. Admins record actual manually completed bank transfers or reject/release reserved funds.
- Firestore rules restrict private profiles, documents, roles, ownership and financial fields. Storage rules restrict file ownership, formats and size. Private admin document links are issued by an authenticated function and expire after five minutes. Client Firestore persistence uses memory to avoid persistent disk copies of private records across sessions; tab memory lasts until the tab closes.

## Validation

Verified: production build and TypeScript pass; 41 frontend tests, 24 Firestore permission tests, 3 Storage permission tests, 4 payment primitive tests and 9 backend workflow tests pass (81 total). Lint has zero errors and 25 hook/refresh warnings. See `artifacts/*-results.txt` for local logs. Isolated emulator project: `demo-needly-audit`; no production accounts, bookings, payments or bank transfers were used during this audit.

Commands:

```powershell
npm ci
npm run typecheck
npm test
npm run build
npm ci --prefix functions
npm test --prefix functions
npm run test:rules
```

The backend emulator suite is `node --test functions/test/workflows.emulator.mjs`, with the isolated Firestore emulator running on 127.0.0.1:8085. It is hard-wired to the demo project and emulator host. Storage tests run with the Storage emulator on 127.0.0.1:9198 using `firebase.audit.json`.

On this Windows installation, Java needs an explicit writable Unix-socket directory via `-Djdk.net.unixdomain.tmpdir=...` when starting an emulator. This is an environment issue, not an application requirement.

## Activation requirements — not deployed by this audit

1. Enable Firebase email/password and Google sign-in, configure authorized domains and email templates, confirm the named Firestore database `needlyy`, and enable Cloud Storage and Functions billing. Existing client Firebase API keys are public application configuration, not payment secrets.
2. Install the backend dependencies. Copy `functions/.env.example` to a local project-specific environment file, set the real site origin and merchant ID, and run `firebase functions:secrets:set PAYHERE_MERCHANT_SECRET`. Never put the merchant secret in a `VITE_` variable or in source control. Sandbox is the default and cannot fund seller payouts.
3. Deploy the reviewed rules, indexes, storage rules, functions and frontend together using the intended Firebase project. Deploying changes affects real authorization and workflows and should be reviewed before activation.
4. In Admin → Settings, set real support email/phone/WhatsApp contact details. Review seller identity applications and any previously inconsistent records before using live payouts.
5. Switch to live PayHere only after verifying a real merchant notification, its amount/signature, duplicate handling, buyer approval and bank reconciliation in the correct account. No live gateway charge or end-to-end email delivery was performed here.

Local emulator mode connects Auth, Firestore, Storage and Functions together; it does not silently send new function calls to production.

## Remaining limits and operational work

- Historical browser-only records are not imported, and legacy Firestore booking IDs are now read using their actual document IDs. Do not infer ownership of old local records from a name; migrate only with a verified mapping of Auth UIDs.
- Payouts are reviewed and executed by an operator, not automatically transferred by a bank API. Refunds/chargebacks need payment-provider and accounting reconciliation. A provider reversal freezes payouts and does not pretend to issue a refund. Held/reversed accounts need operator review before reactivation.
- Support requests, urgent services, overseas enquiries and newsletter requests are stored for staff follow-up. Automatic email/SMS/WhatsApp dispatch and bulk newsletter delivery require a configured messaging service and are not advertised as successful browser actions.
- Account deletion requests are queued for support review to preserve open-order and retention workflows. Deletion is not falsely reported as complete. WhatsApp-based two-factor authentication was removed because no real provider workflow existed.
- Runtime dependency and backend dependency audits are clean at verification. Five high-severity advisory entries remain in the development-only Tailwind 3 glob stack (`braces`/`micromatch`/`fast-glob`/`chokidar`/`tailwindcss`). They concern deeply nested attacker-controlled build patterns. A Tailwind 4 migration is a separate styling/toolchain change; no untrusted pattern compilation is exposed by the deployed application. Do not claim that the entire dependency tree is vulnerability-free.
- No penetration test, production load test, live provider charge or audit of production Firebase Console settings has been performed. Client tests and emulator authorization checks do not verify deployed rules until they are activated.

Sources: [Firebase field restrictions](https://firebase.google.com/docs/firestore/security/rules-fields), [verified Auth token fields](https://firebase.google.com/docs/rules/rules-and-auth), [PayHere signed notification verification](https://support.payhere.lk/api-%26-mobile-sdk/checkout-api).
