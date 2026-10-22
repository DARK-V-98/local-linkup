# Hotel and urgent-service implementation progress

Updated: 22 October 2026. Source changes prepared for GitHub; this document does not indicate production deployment.

## Implemented in this release

- Feed overlap fixed by scoping top-bar height styles to the actual application top bar. Feed content now has responsive column widths and a natural-height heading; fabricated seller rankings and nonfunctional follow buttons were replaced with real discovery links.

- Existing mobile fixes: browse categories collapse on phones; service details wrap long descriptions; booking date/time controls fit narrow screens.
- Business registration offers Hotel / accommodation, including a direct `/register/seller?business=hotel` entry. The existing identity-verification submission is reused before hotel onboarding.
- A dedicated `/dashboard/hotel` workspace contains property onboarding, rooms, packages, extras and guest requests. Existing business sellers can enter without another Auth account.
- Property onboarding stores location, public contact, description, facilities, check-in/out times and policies. Admin approval is separate from identity verification. Private review notes are stored separately from public property data.
- Rooms support nightly prices, guest capacity, unit counts and minimum/maximum nights. These are catalog limits, not dated availability inventory.
- Packages bundle a room type, fixed night count and included extras at a per-room, whole-stay price.
- Extras support once per stay, per room per night, per guest per stay and per guest per night pricing. Included extras are not charged twice.
- Guests can browse approved hotels, choose dates/occupancy/rooms/package/extras and submit custom requirements. The server recalculates canonical pricing and stores snapshots of room, extras, package, policies and itemized estimate.
- Hotels send versioned tailored proposals with a total price, full terms and expiry. Only the guest can agree/decline the current unexpired revision. Accepted proposals cannot be silently repriced. Both parties can close an enquiry.
- Daily authenticated hotel request limits and idempotent request IDs prevent duplicate retries and limit submissions.
- Sellers can apply for urgent-service listing using their own active services, declared service categories, district, public contact and actual service hours.
- Admin reviews hotel/urgent applications at `/admin/business-applications`. Approval requires an active seller and approved identity verification. Sellers cannot self-approve or write public provider listings.
- Emergency discovery now starts with a service category, then matching registered sellers and district filtering. No fabricated category prices, surge multipliers or automatic dispatch claims remain in that flow.
- Urgent seller details retain the urgent context through sign-in and offer contact/quote discussion instead of a fixed-price booking form.
- Suspended or unverified sellers lose urgent public listing; approved hotel publication is revoked pending review. Private records remain protected by ownership rules.

## Intentional first-release boundary

This is the start of the full hotel plan, with real onboarding, catalog and proposal persistence. **Hotel enquiries and accepted proposals are not reservations. No hotel payment or live room guarantee is offered.** That boundary is explicit in the guest and hotel interfaces.

Remaining work from `HOTEL_BUSINESS_PLAN.md`:

1. Property/room galleries, image uploads/crops and fuller accessibility descriptions.
2. Dated inventory, seasonal/blackout calendars, transaction-backed expiring holds and prevention of concurrent overbooking.
3. Child age bands, extra-bed rules, structured inclusion quantities, dependencies and slot-capacity add-ons.
4. Full hotel reservation lifecycle, check-in/out, policy-versioned cancellation and amendments.
5. Hotel-specific deposit/balance checkout, verified payments, settlement, refunds and reconciliation. Do not route hotel IDs into generic service checkout.
6. Staff permissions, multiple properties, PMS/channel synchronization and instant booking.
7. Rich discovery/search, hotel reviews and operational analytics.

Catalog edits do not rewrite existing request snapshots. The current admin workflow uses review-gated property changes; owners contact support to revise an approved property. Advanced catalog versioning and change approvals remain in the broader plan.

## Deployment requirements

Push to GitHub does not deploy Firebase. Deploy frontend, updated Firestore rules and Cloud Functions together in the intended Firebase project. New callable endpoint: `businessOperations`; account-state synchronization also changes. The named application database remains `needlyy`.

New server-write collections: `hotelProperties` with `rooms`/`addons`/`packages` subcollections, `hotelRequests` with immutable `quotes`, `hotelRequestLimits`, `emergencyApplications`, `emergencyProviders`, and private `businessReviews`. Current query shapes use single-field filters. No new composite index is required by these screens.

Admin verification and approved public provider publication must be completed before real sellers appear in emergency matching. No existing seller is automatically declared an emergency provider. No production hotel, guest, identity or financial data was created for testing.

## Verification

Use the isolated Firestore emulator on port 8085 and project `demo-needly-audit` for:

```powershell
npm run typecheck
npm test
npm run build
npm test --prefix functions
node --test functions/test/business.emulator.mjs
node --test scripts/firestore-rules.test.mjs
```

The two emulator suites are hard-wired to local test infrastructure. Run them only with that isolated emulator. They cover permissions, canonical prices, room/guest constraints, immutable proposal revisions, duplicate request retries, seller ownership, approval gates and suspended accounts.

Final checks for this source release: TypeScript and production build pass; 43 frontend tests, 9 backend unit tests (including hotel pricing), 15 emulator backend workflow tests and 27 Firestore authorization tests pass. Lint reports zero errors and 25 existing hook/refresh warnings. Browser checks cover mobile service search/booking, urgent price-free contact, hotel discovery width, and feed heading/content separation on desktop and narrow phones.
