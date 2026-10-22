import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { stayPrice } from "./hotel-pricing.js";
const types = ["roof", "electric", "plumbing", "flood", "medicine", "lockout"];
const fail = message => { throw new HttpsError("invalid-argument", message); };
const text = (value, max = 5000, required = true) => { if (typeof value !== "string" || value.length > max || (required && !value.trim()))
    fail("Check required text fields."); return value.trim(); };
const recordId = value => { const result = text(value, 150); if (!/^[a-zA-Z0-9_-]+$/.test(result))
    fail("Invalid record ID."); return result; };
const strings = (value, max = 20) => { if (!Array.isArray(value) || value.length > max || value.some(item => typeof item !== "string" || item.length > 200))
    fail("Check your selections."); return [...new Set(value)]; };
const integer = (value, min, max) => { if (!Number.isSafeInteger(value) || value < min || value > max)
    fail("Check numeric fields."); return value; };
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
export function businessOperations(db, actor) {
    return onCall({ region: "us-central1", maxInstances: 10 }, async (request) => {
        const user = await actor(request), data = request.data ?? {}, action = data.action;
        const seller = () => { if (user.role !== "seller" && user.role !== "admin" && user.role !== "developer")
            throw new HttpsError("permission-denied", "A seller account is required."); };
        const stamp = { updatedAt: FieldValue.serverTimestamp() };
        if (action === "saveHotel") {
            seller();
            if (user.sellerType !== "business")
                throw new HttpsError("failed-precondition", "Register a business seller account before hotel onboarding.");
            const input = data.property ?? {}, ref = db.doc(`hotelProperties/${user.uid}`), old = await ref.get();
            if (old.exists && ["approved", "suspended"].includes(old.data().status))
                throw new HttpsError("failed-precondition", "Approved property changes require support review. Suspended properties cannot resubmit.");
            if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.checkIn) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.checkOut))
                fail("Enter check-in and check-out times.");
            await ref.set({ ownerId: user.uid, name: text(input.name, 120), district: text(input.district, 80), address: text(input.address, 500), description: text(input.description), phone: text(input.phone, 40), website: text(input.website ?? "", 300, false), checkIn: input.checkIn, checkOut: input.checkOut, facilities: strings(input.facilities), policy: text(input.policy), status: "pending", ...stamp }, { merge: false });
            return { id: user.uid };
        }
        if (action === "saveHotelItem" || action === "deleteHotelItem") {
            seller();
            const kind = data.kind;
            if (!["rooms", "addons", "packages"].includes(kind))
                fail("Unknown catalog section.");
            const property = await db.doc(`hotelProperties/${user.uid}`).get();
            if (!property.exists || property.data().status === "suspended")
                throw new HttpsError("failed-precondition", "Complete active hotel onboarding first.");
            const item = data.item ?? {}, itemId = data.id ? recordId(data.id) : db.collection("ids").doc().id, ref = db.doc(`hotelProperties/${user.uid}/${kind}/${itemId}`);
            if (action === "deleteHotelItem") {
                await ref.update({ active: false, ...stamp });
                return { id: itemId };
            }
            const priceMinor = integer(item.priceMinor, 0, 100000000), active = item.active === true;
            if (kind === "rooms" && priceMinor === 0)
                fail("Enter a room rate above zero.");
            const clean = { name: text(item.name, 120), description: text(item.description, 3000, false), priceMinor, active, ...stamp };
            if (kind === "rooms") {
                clean.capacity = integer(item.capacity, 1, 20);
                clean.units = integer(item.units, 1, 500);
                clean.minNights = integer(item.minNights, 1, 90);
                clean.maxNights = integer(item.maxNights, clean.minNights, 90);
            }
            if (kind === "addons") {
                if (!["stay", "night", "person", "person_night"].includes(item.basis))
                    fail("Choose a pricing basis.");
                clean.basis = item.basis;
            }
            if (kind === "packages") {
                clean.roomId = recordId(item.roomId);
                clean.nights = integer(item.nights, 1, 90);
                clean.includedAddonIds = strings(item.includedAddonIds);
                const room = await db.doc(`hotelProperties/${user.uid}/rooms/${clean.roomId}`).get();
                if (!room.exists || !room.data().active)
                    fail("Choose an active room type.");
                for (const addonId of clean.includedAddonIds) {
                    const extra = await db.doc(`hotelProperties/${user.uid}/addons/${recordId(addonId)}`).get();
                    if (!extra.exists || !extra.data().active)
                        fail("Choose active included extras.");
                }
                if (priceMinor === 0)
                    fail("Enter a package price above zero.");
            }
            await ref.set(clean);
            return { id: itemId };
        }
        if (action === "applyEmergency") {
            seller();
            const current = await db.doc(`emergencyApplications/${user.uid}`).get();
            if (current.exists && current.data().status === "suspended")
                throw new HttpsError("permission-denied", "Contact support about your suspended application.");
            const selected = strings(data.types, 6), serviceIds = strings(data.serviceIds, 5);
            if (!selected.length || selected.some(item => !types.includes(item)) || !serviceIds.length)
                fail("Select at least one emergency category and one active service.");
            for (const serviceId of serviceIds) {
                const service = await db.doc(`services/${recordId(serviceId)}`).get();
                if (!service.exists || service.data().sellerId !== user.uid || service.data().status !== "active")
                    fail("Select your own active services.");
            }
            const batch = db.batch();
            batch.set(db.doc(`emergencyApplications/${user.uid}`), { ownerId: user.uid, displayName: text(user.businessName || user.name, 120), district: text(data.district, 80), phone: text(data.phone, 40), hours: text(data.hours, 300), description: text(data.description, 2000), types: selected, serviceIds, status: "pending", ...stamp });
            batch.delete(db.doc(`emergencyProviders/${user.uid}`));
            await batch.commit();
            return { id: user.uid };
        }
        if (action === "reviewBusiness") {
            await actor(request, true);
            const kind = data.kind, uid = recordId(data.id), status = data.status;
            if (!["hotel", "emergency"].includes(kind) || !["approved", "changes_requested", "rejected", "suspended"].includes(status))
                fail("Invalid review.");
            const ref = db.doc(`${kind === "hotel" ? "hotelProperties" : "emergencyApplications"}/${uid}`);
            await db.runTransaction(async (tx) => {
                const snap = await tx.get(ref), owner = await tx.get(db.doc(`users/${uid}`)), verification = await tx.get(db.doc(`verifications/${uid}`));
                if (!snap.exists)
                    fail("Application not found.");
                if (status === "approved" && (!owner.exists || owner.data().status === "suspended" || !owner.data().verified || verification.data()?.status !== "approved"))
                    throw new HttpsError("failed-precondition", "Approve identity verification for an active seller first.");
                if (status === "approved" && kind === "emergency")
                    for (const serviceId of snap.data().serviceIds) {
                        const service = await tx.get(db.doc(`services/${recordId(serviceId)}`));
                        if (!service.exists || service.data().sellerId !== uid || service.data().status !== "active")
                            fail("The application includes an inactive or unowned service.");
                    }
                tx.update(ref, { status, ...(kind === "emergency" ? { notes: text(data.notes ?? "", 2000, false) } : {}), ...stamp });
                tx.set(db.doc(`businessReviews/${kind}_${uid}`), { ownerId: uid, kind, status, notes: text(data.notes ?? "", 2000, false), reviewedBy: user.uid, ...stamp });
                if (kind === "emergency") {
                    const publicRef = db.doc(`emergencyProviders/${uid}`);
                    if (status === "approved") {
                        const { ownerId, displayName, district, phone, hours, description, types, serviceIds } = snap.data();
                        tx.set(publicRef, { ownerId, displayName, district, phone, hours, description, types, serviceIds });
                    }
                    else
                        tx.delete(publicRef);
                }
            });
            return { id: uid };
        }
        if (action === "requestStay") {
            const propertyId = recordId(data.propertyId), input = data.selection ?? {}, requestId = recordId(data.requestId), ref = db.doc(`hotelRequests/${requestId}`);
            if (!requestId.startsWith(user.uid + "_"))
                fail("Invalid request key.");
            await db.runTransaction(async (tx) => {
                const existing = await tx.get(ref);
                if (existing.exists) {
                    if (existing.data().buyerId !== user.uid)
                        fail("Request key already used.");
                    return;
                }
                const property = await tx.get(db.doc(`hotelProperties/${propertyId}`)), owner = await tx.get(db.doc(`users/${propertyId}`));
                if (!property.exists || property.data().status !== "approved" || (owner.data()?.status === "suspended" || owner.data()?.verified !== true))
                    throw new HttpsError("failed-precondition", "This property is not accepting requests.");
                if (propertyId === user.uid)
                    fail("You cannot request your own hotel.");
                const roomId = recordId(input.roomId), packageId = input.packageId ? recordId(input.packageId) : "", addonIds = strings(input.addonIds);
                const room = await tx.get(db.doc(`hotelProperties/${propertyId}/rooms/${roomId}`));
                const pack = packageId ? await tx.get(db.doc(`hotelProperties/${propertyId}/packages/${packageId}`)) : null;
                const allAddonIds = [...new Set([...addonIds, ...(pack?.data()?.includedAddonIds ?? [])])];
                const addons = [];
                for (const addonId of allAddonIds) {
                    const extra = await tx.get(db.doc(`hotelProperties/${propertyId}/addons/${recordId(addonId)}`));
                    if (extra.exists)
                        addons.push({ id: extra.id, ...extra.data() });
                }
                if (packageId && !pack?.exists)
                    fail("Package not found.");
                if (addons.length !== allAddonIds.length || addons.some(item => !item.active))
                    fail("An included or selected extra is no longer available.");
                const quotaRef = db.doc(`hotelRequestLimits/${user.uid}_${today()}`), quota = await tx.get(quotaRef);
                if ((quota.data()?.count ?? 0) >= 30)
                    throw new HttpsError("resource-exhausted", "Daily hotel request limit reached. Please try again tomorrow.");
                const selection = { arrival: text(input.arrival, 10), departure: text(input.departure, 10), adults: input.adults, children: input.children, rooms: input.rooms, roomId, packageId, addonIds, notes: text(input.notes ?? "", 3000, false) };
                if (selection.arrival < today())
                    fail("Choose today or a future arrival.");
                let estimate;
                try {
                    estimate = stayPrice(selection, room.data(), addons, pack?.data() ?? null);
                }
                catch (error) {
                    fail(error.message);
                }
                tx.set(quotaRef, { count: (quota.data()?.count ?? 0) + 1 });
                tx.create(ref, { ...selection, buyerId: user.uid, buyerName: user.name, ownerId: propertyId, propertyId, propertyName: property.data().name, status: "requested", estimateMinor: estimate.totalMinor, estimate, addonSnapshots: addons, roomSnapshot: room.data(), packageSnapshot: pack?.data() ?? null, policySnapshot: property.data().policy, createdAt: FieldValue.serverTimestamp(), ...stamp });
            });
            return { id: requestId };
        }
        if (action === "quoteStay" || action === "answerStayQuote" || action === "closeStay") {
            const ref = db.doc(`hotelRequests/${recordId(data.id)}`);
            await db.runTransaction(async (tx) => {
                const snap = await tx.get(ref);
                if (!snap.exists)
                    fail("Request not found.");
                const row = snap.data();
                if (action === "quoteStay") {
                    if (row.ownerId !== user.uid)
                        throw new HttpsError("permission-denied", "Only the hotel can send this proposal.");
                    if (!["requested", "quoted"].includes(row.status))
                        fail("This request cannot be requoted.");
                    const property = await tx.get(db.doc(`hotelProperties/${row.propertyId}`));
                    if (property.data()?.status !== "approved" || !user.verified)
                        fail("Hotel and identity approval are required.");
                    const expires = text(data.quoteExpires, 10);
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(expires) || !Number.isFinite(Date.parse(expires + "T00:00:00Z")) || new Date(expires + "T00:00:00Z").toISOString().slice(0, 10) !== expires || expires < today() || expires > row.arrival)
                        fail("Choose a valid proposal expiry no later than arrival.");
                    const version = (row.quoteVersion ?? 0) + 1, patch = { quoteMinor: integer(data.quoteMinor, 1, 1000000000), quoteTerms: text(data.quoteTerms, 5000), quoteExpires: expires, quoteVersion: version, status: "quoted", ...stamp };
                    tx.create(ref.collection("quotes").doc(String(version)), { ...patch, createdBy: user.uid });
                    tx.update(ref, patch);
                }
                else if (action === "answerStayQuote") {
                    if (row.buyerId !== user.uid)
                        throw new HttpsError("permission-denied", "Only the guest can answer this proposal.");
                    const property = await tx.get(db.doc(`hotelProperties/${row.propertyId}`));
                    if (property.data()?.status !== "approved")
                        fail("This hotel is not accepting proposal agreements.");
                    if (row.status !== "quoted" || row.quoteVersion !== data.quoteVersion || row.quoteExpires < today())
                        fail("The proposal changed or expired. Reload before responding.");
                    if (!["accepted", "declined"].includes(data.status))
                        fail("Choose accept or decline.");
                    tx.update(ref, { status: data.status, acceptedQuoteVersion: row.quoteVersion, ...stamp });
                }
                else {
                    if (row.ownerId !== user.uid && row.buyerId !== user.uid)
                        throw new HttpsError("permission-denied", "You cannot close this request.");
                    tx.update(ref, { status: "closed", ...stamp });
                }
            });
            return { id: data.id };
        }
        fail("Unknown business operation.");
    });
}
