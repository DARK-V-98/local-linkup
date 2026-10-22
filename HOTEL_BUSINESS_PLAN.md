# Hotel businesses and package builder — implementation plan

Status: implementation started. See `HOSPITALITY_IMPLEMENTATION.md` for completed functionality, deployment requirements and remaining phases. This document describes the complete target scope.

## 1. Product direction

Add **Hotel / accommodation** as a business type during seller registration. Hotel owners receive a dedicated hotel workspace, while guests continue to use their existing buyer accounts. Keep the existing Needlyy logo, green/blue/navy palette, authentication, verification, messaging, and financial foundations.

This is a business capability, not a paid subscription plan. Subscription pricing, commissions, and billing tiers require a separate product decision; registration must not imply a subscription or charge.

The system should support three connected selling flows:

1. **Ready-made packages:** the hotel publishes an offer, such as a two-night stay with breakfast.
2. **Build your stay:** guests select dates, rooms, meal plans, and compatible add-ons within rules set by the hotel.
3. **Tailored proposals:** a guest requests something specific and the hotel creates a dated, itemized quote for approval.

Recommendation: launch with one property per hotel business, room-type inventory, LKR pricing, and request-to-book confirmation. Design the data model for multiple properties, but introduce instant booking only after inventory and payment race conditions have been tested.

## 2. Fit with the current application

The current app has individual/business seller registration in `src/pages/RegisterSeller.tsx`, seller navigation in `src/components/dashboard/navigation.ts`, and generic service documents in `src/lib/firestore/services.ts`. Hotel-specific inventory, nightly prices, occupancy, and reservation states need their own model rather than being forced into generic service prices and booking statuses.

- Preserve the existing `seller` account role. Add a server-controlled hotel business membership and capability.
- Generic businesses retain the current seller dashboard.
- Hotel members enter `/dashboard/hotel`; accounts with multiple capabilities get an explicit workspace switcher.
- Use the named Firestore database `needlyy` and Cloud Functions as in the current system.
- Reuse authentication, verified-email checks, private verification uploads, support/dispute patterns, and signed payment verification where suitable.
- Extend payment references to identify the booking type. Do not send hotel reservation IDs through generic service-booking functions without updating server validation.
- Preserve existing users, services, and bookings. Existing hotels can request hotel-business onboarding without creating another Auth account.

## 3. Hotel registration and onboarding

### Entry and account creation

Registration path: **Offer services → Business → Hotel / accommodation**. Do not require a user to choose a general service category to access the hotel flow.

For a new user, collect owner/contact name, email, phone, password, and terms consent through existing registration security. Verify email before submission for review. An existing authenticated seller continues with their current identity. Account creation and hotel setup are separate recoverable steps: retain a draft so a failed upload does not create duplicate accounts.

### Property information

Collect the following through short, saved steps:

| Group | Fields and options |
| --- | --- |
| Business | Legal entity name, trading name, registration number, business address, authorized representative |
| Property | Hotel name, type (hotel, resort, villa, guesthouse, boutique stay), description, district, city, postal address, map pin |
| Contact | Reservation email/phone, optional WhatsApp, website, supported languages |
| Operations | Check-in/check-out times, front-desk hours, arrival instructions, emergency contact |
| Facilities | Wi-Fi, parking, pool, restaurant, air conditioning, lift, accessible facilities, family facilities, pet policy |
| Policies | Children/extra beds, pets, smoking, minimum check-in age, cancellations, deposits, damage deposit and accessibility details |
| Media | Cover image, ordered gallery, image descriptions, logo if available; preview crops on mobile and desktop |
| Verification | Business certificate, representative identity, evidence of authority/property management, applicable accommodation documents where required |

Self-declared property/star classifications must be labelled as such until verified. Do not turn a facility checkbox into a certified accessibility claim. Private documents and payout details must never appear in public property documents.

### Approval and readiness

Business states: `draft → submitted → under_review → approved`; admin can use `changes_requested`, `rejected`, or `suspended` with reasons and audit history. Store account suspension separately from application rejection.

Allow draft room/package setup while review is pending. Publishing requires verified email, approved active business, a complete property profile, at least one room type, usable availability, and approved publishable content. Payments/payout readiness may be a separate gate. Admin approval must be server controlled; choosing “Hotel” never grants approval.

Show a clear onboarding checklist and next action. Distinguish successful account creation from a hotel application still awaiting review.

## 4. Dedicated hotel dashboard

| Section | Main actions and information |
| --- | --- |
| Overview | Today's arrivals/departures, pending requests, confirmed stays, unanswered enquiries, setup checklist, payment exceptions |
| Reservations | Search/filter by date, guest and status; inspect price snapshot, timeline, balance, cancellation and messages |
| Availability | Room-type calendar, available units, stop-sell dates, maintenance blocks, seasonal overrides |
| Rooms | Room types, capacity, beds, amenities, photos, base nightly rates and inventory quantities |
| Packages | Create, duplicate into a new draft, preview, publish, pause and archive package offers |
| Add-ons | Manage extras, prices, availability, quantities, dependencies and capacity |
| Custom requests | Guest requirements, hotel questions, proposal builder, revisions, quote expiry and acceptance |
| Messages | Reservation/request-linked conversations with authorized guests |
| Property | Public profile, gallery, contact details, facilities and policies |
| Finance | Real paid/pending/refunded amounts, deposits, reconciliation, payout eligibility and statements |
| Reports | Confirmed room nights, occupancy, package sales, cancellations, add-on revenue and date comparisons |
| Team | Later: invited members, property assignment and restricted permissions |
| Settings | Notifications, booking rules, tax/fee configuration, integrations and account security |

All metrics must derive from records, include date ranges, and explain exclusions. Occupancy is confirmed room nights divided by sellable room nights; maintenance blocks affect the denominator. Pending enquiries and expired holds do not count as occupied rooms. Never fill empty charts with sample revenue.

## 5. Rooms and inventory

Each room type needs name, description, ordered photos, bed configuration, unit count, maximum adults/children/total occupants, maximum extra beds, amenities, accessible features, base rate, meal options and cancellation policy.

- Support multiple units of a room type without requiring named physical room assignment in the first release.
- Use arrival date inclusive and departure date exclusive for inventory and nightly billing.
- Store property timezone (`Asia/Colombo` initially), local stay dates, and server timestamps separately.
- Validate adults, children and child ages against occupancy and hotel-defined age bands. Infants, extra beds and complimentary children need explicit rules.
- Minimum/maximum nights, arrival restrictions, advance booking window, cutoff time, closed dates and minimum notice must be enforceable on the server.
- Calendar edits must show existing confirmed bookings. Do not allow capacity reductions below committed inventory without an explicit resolution process.
- Treat maintenance blocks, temporary holds and confirmed reservations as distinct inventory allocations.
- Once external-channel inventory is introduced, define the source of truth and sync-failure behavior before enabling instant booking.

## 6. Detailed package builder

Use a guided builder with a persistent draft, desktop summary panel, mobile step navigation, validation, and a guest-facing preview.

| Step | Hotel configuration |
| --- | --- |
| Identity | Name, package type, short summary, full description, cover/gallery, audience and highlights |
| Stay | Eligible room types, room quantities, nights, adults/children, occupancy and extra-bed rules |
| Inclusions | Included meals, transfers, activities, facilities, welcome items; quantities and timing must be explicit |
| Dates | Sale window, travel window, eligible weekdays, blackout dates, seasonal rates, booking notice |
| Pricing | Per stay / per room per night / per person per night, included occupancy, extra-person rates, child bands, taxes and fees |
| Extras | Allowed add-ons, required choices, optional upgrades, selection limits and dependency rules |
| Policies | Deposit, balance due date, cancellation/refund rules, no-show rules and change conditions |
| Review | Availability check, price examples, policy summary, desktop/mobile preview and publish checklist |

Package types can include room-only stays, breakfast/half-board/full-board stays, honeymoon stays, family breaks, wellness stays and event/group offers. Day-use and event packages require separate time-slot/venue capacity; initially support them as quote-only enquiries until that capacity model exists.

Advanced options include valid promo codes, controlled discount stacking, minimum group size, private/public visibility, sales caps and scheduled publication. Every discount needs scope, dates and usage limits. Do not implement arbitrary user-authored pricing scripts.

Publication states: `draft`, `published`, `paused`, `archived`. Published offers use immutable versions; edits create a new version. Existing reservations and accepted quotes retain the exact booked terms, media references, inclusions and prices even when a package changes.

## 7. Add-on catalog and constraints

Each add-on contains title, description, category, optional image, active dates, applicable room/package IDs, currency, price basis, quantity limits and fulfillment notes.

Examples: airport pickup, breakfast upgrade, dinner, extra bed, late checkout, spa session, guided excursion, celebration decoration and laundry credit.

| Option | Required behavior |
| --- | --- |
| Pricing basis | Per booking, per room, per night, per person, per person per night, per unit or per selected time slot |
| Guest applicability | Adults/children and eligible ages; use explicit counts rather than guessing from total guests |
| Quantity | Minimum/maximum, increment, per-day/per-stay limits and included complimentary quantities |
| Dates/timing | Available service dates, days of week, duration, advance notice, scheduling requirements |
| Capacity | Shared daily/slot capacity for transfers, spa or activities; included items consume capacity too |
| Dependencies | Requires another selection; mutually exclusive choices; unavailable with certain room types |
| Fulfillment | Guest details needed, pickup time/location, dietary notes, delivery instructions |
| Financial terms | Tax treatment, refundability, payment timing and cancellation cutoff |

For example, late checkout may conflict with the next arrival and should be request-only until the inventory rule can prove it is available. Special dietary requests are requests until the hotel explicitly confirms them. Reject circular dependencies and incompatible package configurations during publish validation.

## 8. Guest-built custom packages

Guest flow: **Choose property → dates/guests → room selection → meal plan → compatible extras → itemized review → availability check → booking request/payment**.

- Show running totals, included items, exclusions and cancellation conditions at every relevant step.
- Recalculate on the server whenever dates, occupancy, rooms, extras or discounts change.
- Disable unavailable selections with a useful explanation and available alternatives.
- Keep an anonymous configuration as a non-binding draft; require sign-in for submitting requests or booking.
- Require acknowledgement of the final policy version before submission.
- Clearly label estimates, quotes, held inventory, pending hotel confirmation and confirmed reservations.

A guest can instead submit a tailored request with date flexibility, adults/children, rooms, budget, occasion, meals, transport, activities and accessibility needs. Avoid collecting sensitive identity or medical documents in general request text. Only the guest and authorized hotel/admin staff may read private requirements.

## 9. Hotel-issued custom quotes

The hotel selects real catalog items or adds clearly described custom line items, quantities, unit prices, dates, inclusions, exclusions, deposit and policies. Record whether custom items require manual fulfillment and whether they consume inventory.

Quote lifecycle: `draft → sent → accepted`, with `declined`, `expired` and `superseded` alternatives. Each revision is immutable once sent. Only one current revision can be accepted, through a server transaction. Accepted quotes cannot be silently edited.

An enquiry or sent quote does not reserve stock by default. On acceptance, atomically recheck room/add-on capacity and create a short-lived hold before payment or hotel confirmation. If stock or price changed, explain the issue and request approval of a replacement quote; never silently substitute a room or price.

## 10. Pricing, reservation and payment workflow

Use integer minor units for all money, explicit LKR currency, deterministic rounding and versioned pricing rules. Calculate each nightly rate, occupancy supplement, add-on, discount, tax and fee on the backend. Store the result as an immutable itemized snapshot with a quote expiry. Tax rates are configurable values requiring business validation; this plan assumes no particular statutory rate.

Recommended initial flow:

1. Guest submits a valid configuration; backend checks property/package status, price and capacity.
2. Create a reservation request and notify the hotel. The request itself does not guarantee inventory.
3. Hotel accepts; a transaction allocates a hold with an explicit expiry and issues the payment request.
4. Verified payment within the valid hold converts inventory into a confirmed reservation. Use idempotent operations so retries and duplicate notifications cannot allocate twice.
5. Hotel records check-in, then check-out. Finance release follows explicit settlement/dispute policy; do not reuse buyer-approved service completion without defining hotel settlement rules.

Model **reservation**, **payment**, **inventory allocation** and **refund** statuses separately. Examples: reservation `requested/accepted/confirmed/checked_in/checked_out/cancelled/no_show`; payment `unpaid/part_paid/paid/failed/refund_pending/part_refunded/refunded`; allocation `held/committed/released/expired`.

Support deposit and balance tracking as separate payment attempts/obligations. Confirm the existing provider supports the chosen split-payment flow before shipping it. Bank/cash payments require an authorized recorded reconciliation; uploading a screenshot or pressing “I paid” is not payment verification.

Critical handling:

- No negative capacity; all competing holds/confirmations use transactions across the same date/room inventory records.
- Expired holds must be ignored during availability reads even if scheduled cleanup is delayed.
- If payment arrives after expiry and inventory is unavailable, create an exception for operator resolution/refund; never overbook or falsely confirm.
- Booking changes use repricing and explicit guest acceptance; keep original and amended versions.
- Cancellation computes eligibility from the booked policy snapshot and releases eligible allocations once. A refund request is distinct from a provider-confirmed refund.
- Reuse existing dispute holds and reversal protections, extended for hotel reservations.

## 11. Public pages and buyer dashboard

Add hotel discovery with district, travel dates, guests, room count, budget, facilities and package-type filters. Date-specific availability must be checked server-side; cached search results are indicative.

Property pages show responsive galleries, facilities, room types, map link/location, verified business status, policies, packages and the stay builder. Package pages clearly state “from” price assumptions, actual selected-date totals and whether hotel confirmation is required.

Buyer dashboard gets **Hotel stays** with reservation details, guest configuration, payment balance, check-in information, messages, cancellation requests and custom quotes. Keep hotel stays recognizable beside existing service bookings. Reviews require an eligible completed stay and must not reuse generic service reviews without checking reservation ownership.

## 12. Mobile and desktop experience

- Desktop: hotel sidebar, calendar/table views, split-screen package editor and price preview.
- Mobile: Overview, Reservations, Packages and More navigation; stacked reservation cards and day/week calendar views.
- Package builder: saved steps, clear progress, persistent total/next action, minimum 44px touch targets and keyboard-friendly controls.
- Date picker: explicit arrival/departure, night count, blocked dates and field validation; no hover-only actions.
- Use existing brand components and Lucide icons. Offer image crop previews, upload progress, retry/remove/reorder and image descriptions.
- Provide loading, empty, offline, failed-save and permission-denied states. Announce save status accessibly; do not show success before persistence succeeds.

## 13. Proposed data model

These are proposed collections, not existing deployed schemas. Keep public catalog projections separate from private operational documents.

| Collection/path | Purpose |
| --- | --- |
| `hotelBusinesses/{id}` | Private owner, approval, legal/contact and operational settings |
| `hotelBusinesses/{id}/members/{uid}` | Property-scoped membership and permission set |
| `hotelApplications/{id}` | Private verification submission, revisions and admin review |
| `hotelProperties/{id}` | Private operational property configuration |
| `publicHotels/{id}` | Sanitized approved property profile for public queries |
| `hotelRoomTypes/{id}` | Authoritative room configuration and capacity rules |
| `hotelAddons/{id}` | Authoritative add-on catalog and constraints |
| `hotelPackages/{id}/versions/{version}` | Package draft/version data and immutable published definitions |
| `publicHotelPackages/{id}` | Public discovery projection referencing the published version |
| `hotelInventory/{propertyRoomDateKey}` | Per-room-type, per-local-date capacity, blocks and allocations |
| `hotelAddonInventory/{addonDateSlotKey}` | Shared dated/slot add-on capacity |
| `hotelRequests/{id}` | Private guest requirements and enquiry status |
| `hotelQuotes/{id}/revisions/{revision}` | Immutable sent proposals, pricing and expiry |
| `hotelReservations/{id}` | Guest/business references, stay configuration, snapshots and state |
| `hotelHolds/{id}` | Expiring allocation references and idempotency key |
| `hotelAuditEvents/{id}` | Server-created transition history and actor references |

Use subcollections for large histories/galleries as needed rather than unbounded document arrays. Payment/refund documents should extend the existing financial model with a validated resource type and reservation reference. Indexes should follow actual guest/business/status/date queries. Paginate reservations and reports; choose a dedicated search service later if Firestore queries cannot satisfy discovery requirements.

## 14. Permissions, privacy and admin operations

- Server-authoritative writes for approval, membership, published projections, pricing snapshots, inventory, reservation transitions and money.
- Owners edit only their business drafts and permitted configuration fields. Staff permissions, when added, distinguish owner, manager, reservations, finance and content editor.
- Buyers read only their own private requests, quotes, reservations and financial references.
- Public access is restricted to sanitized approved active catalog records; no representative ID, private guest contact, bank details or document URLs.
- Private uploads use validated size/type rules, authorized storage paths and short-lived admin access.
- Hotel admins cannot self-award platform verification, alter guest payment outcomes, or access other properties by changing IDs.
- Add admin hotel application review, property/package moderation, reservation exceptions, suspension reasons and audit history.
- Suspending a property stops new sales while preserving controlled access for existing reservation fulfillment, cancellations and support. Define actor-specific permissions for that state.
- Rate-limit quote/hold/payment operations; validate structured text/URLs, sanitize displayed content, and test tenant isolation.
- Do not collect passport/ID scans from guests in the initial release. Any later requirement needs a separate privacy, retention and access design.

## 15. Delivery phases

| Phase | Deliverable | Acceptance gate |
| --- | --- | --- |
| 1. Foundations | Hotel business onboarding, recovery, private verification, admin approval and dashboard routing | No privilege escalation; ordinary seller registration still works |
| 2. Catalog | Property profile, rooms, gallery, dated inventory, package and add-on drafts | Valid configurations persist; unpublished/private data stays private |
| 3. Discovery and builder | Public property/package pages, guest stay configurator, server pricing and quote requests | Selected dates/occupancy/extras produce explainable consistent totals |
| 4. Reservations | Hotel acceptance, atomic holds, confirmation, cancellation, deposit/payment integration | Concurrency, duplicate webhook and expired-hold tests pass |
| 5. Custom proposals | Quote revisions, expiry, acceptance, inventory conversion and buyer dashboard | Exactly one revision is accepted; booked terms stay immutable |
| 6. Operational release | Notifications, exception queues, reporting, support and monitoring | Staging end-to-end scenarios and mobile accessibility checks pass |
| Later | Staff invitations, multiple properties, instant booking, channel/PMS sync, scheduled add-ons, advanced promotions | Each capability has explicit permissions and operational ownership |

Phases 1–6 form the first complete release. Do not expose a “Book now” action that only saves a local draft or bypasses unfinished inventory/payment steps.

## 16. Test and release checklist

- Register a hotel, resume interrupted onboarding, request changes, resubmit, approve and suspend; verify existing buyers/sellers remain functional.
- Save/reload a room, gallery, package and add-on; reject invalid capacity, negative amounts, circular dependencies and conflicting options.
- Test one-night, cross-month, leap-day, child-band, multi-room, seasonal-rate, blackout and timezone-boundary calculations.
- Have two guests compete for the last room and last add-on slot; only permitted capacity is committed.
- Test duplicate submission, quote acceptance retry, multiple revisions, expired quote and expired hold cleanup delays.
- Test deposit/balance, duplicate/out-of-order payment notifications, failure, late payment, cancellation, refund reconciliation and reversal holds.
- Verify guest A cannot read guest B; hotel A cannot edit hotel B; content staff cannot change finance or membership.
- Confirm media/document access rules, public projections, approved-only publication and exact booked snapshots after catalog edits.
- Verify request-to-book wording, no fabricated availability/revenue, notification failure recovery, and admin exception visibility.
- Validate 320px/390px phones, tablet and desktop; keyboard flow, screen-reader labels, focus, image crops and slow-network recovery.
- Release behind a feature flag to staging with emulator authorization tests and test-gateway transactions before production activation.

## 17. Product decisions to settle before implementation

Recommended defaults allow design and schema preparation; financial/commercial choices must be confirmed before enabling live sales.

| Decision | Recommended starting point |
| --- | --- |
| Account model | Hotel capability on a seller business, one property initially |
| Confirmation | Request-to-book first; instant booking later |
| Currency/market | LKR, Sri Lanka, property-local dates |
| Inventory | Room-type quantities; manual availability management initially |
| Custom packages | Both guest-configured catalog selections and hotel-issued tailored quotes |
| Deposits | Configurable only after provider capability and settlement policy are confirmed |
| Commissions/taxes | Explicit configurable rules; no invented fee or statutory rate |
| Settlement | Define hotel-specific payout timing, disputes and cancellation reconciliation before payment launch |
| External integrations | No implied PMS/channel sync, email dispatch or bank automation without a real configured integration |
| Subscription plans | Separate future decision; hotel business selection itself does not charge users |

## 18. Initial implementation map

- Extend `RegisterSeller.tsx`, Auth profile/business types and onboarding persistence.
- Extend `App.tsx`, protected capability checks and workspace navigation for `/dashboard/hotel/*`.
- Add hotel domain types, Firestore repositories, hooks and server functions for the collections above.
- Add property/room/package/add-on editors, availability views, reservation operations and custom-quote screens.
- Add public `/hotels`, `/hotels/:propertyId`, package detail/configuration routes and buyer hotel-stay routes.
- Extend admin review/requests, financial references, notifications, Firestore/Storage rules and indexes.
- Add meaningful pricing, inventory-concurrency, permission and end-to-end workflow tests before enabling the feature.

This document is the planning deliverable. Implementation, subscriptions, production deployment and live hotel/payment operations are separate work.
