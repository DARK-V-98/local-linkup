import { businessOperations as createBusinessOperations } from "./business.js";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentWritten } from "firebase-functions/v2/firestore";
import { defineSecret, defineString } from "firebase-functions/params";
import { checkoutHash, validNotification, toMinor, canSettle } from "./payments.js";
initializeApp();
const db = getFirestore("needlyy");
const secret = defineSecret("PAYHERE_MERCHANT_SECRET");
const merchant = defineString("PAYHERE_MERCHANT_ID");
const site = defineString("SITE_ORIGIN");
const sandbox = defineString("PAYHERE_SANDBOX", { default: "true" });
const OWNER = "tikfese@gmail.com";
const options = { region: "us-central1", maxInstances: 10 };
async function actor(request, admin = false) {
    if (!request.auth)
        throw new HttpsError("unauthenticated", "Sign in first.");
    const profile = await db.doc(`users/${request.auth.uid}`).get();
    if (!profile.exists || profile.data().status === "suspended")
        throw new HttpsError("permission-denied", "Account unavailable.");
    if (admin && !(request.auth.token.email_verified && request.auth.token.email === OWNER) && profile.data().role !== "admin")
        throw new HttpsError("permission-denied", "Administrator access required.");
    return { uid: request.auth.uid, ...profile.data() };
}
function id(value) {
    if (typeof value !== "string" || !value || value.length > 200 || value.includes("/"))
        throw new HttpsError("invalid-argument", "Invalid record ID.");
    return value;
}
function requireText(value, max = 200) {
    if (typeof value !== "string" || !value.trim() || value.length > max)
        throw new HttpsError("invalid-argument", "Check the required fields.");
    return value.trim();
}
export const createCheckout = onCall({ ...options, secrets: [secret] }, async (request) => {
    const user = await actor(request);
    const bookingId = id(request.data?.bookingId);
    const origin = site.value().replace(/\/$/, "");
    if (!/^https:\/\//.test(origin))
        throw new HttpsError("failed-precondition", "Configure the public HTTPS site origin.");
    if (!merchant.value() || !secret.value())
        throw new HttpsError("failed-precondition", "Payments are not configured.");
    const ref = db.doc(`bookings/${bookingId}`);
    const booking = await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const payment = await tx.get(db.doc(`payments/${bookingId}`));
        if (!snap.exists || snap.data().buyerId !== user.uid)
            throw new HttpsError("permission-denied", "Booking unavailable.");
        if (!["confirmed", "in_progress", "completed"].includes(snap.data().status))
            throw new HttpsError("failed-precondition", "The seller must accept this booking before payment.");
        if (payment.data()?.status === "paid")
            throw new HttpsError("already-exists", "This booking is already paid.");
        const data = snap.data();
        const amountMinor = toMinor(data.price);
        tx.set(db.doc(`payments/${bookingId}`), { bookingId, buyerId: data.buyerId, sellerId: data.sellerId, serviceTitle: data.serviceTitle, amountMinor, currency: "LKR", method: "payhere", test: sandbox.value() === "true", status: "pending", released: false, createdAt: FieldValue.serverTimestamp() });
        return { ...data, amountMinor };
    });
    const amount = (booking.amountMinor / 100).toFixed(2);
    return { sandbox: sandbox.value() === "true", merchant_id: merchant.value(), return_url: `${origin}/booking/confirm/${bookingId}`, cancel_url: `${origin}/booking/confirm/${bookingId}`, notify_url: `https://us-central1-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/payhereNotify`, order_id: bookingId, items: booking.serviceTitle, amount, currency: "LKR", first_name: user.name.split(" ")[0], last_name: user.name.split(" ").slice(1).join(" ") || "Customer", email: user.email, phone: booking.customerPhone, address: booking.district, city: booking.district, country: "Sri Lanka", hash: checkoutHash(merchant.value(), bookingId, amount, secret.value()) };
});
async function releaseFunds(bookingId) {
    await db.runTransaction(async (tx) => {
        const paymentRef = db.doc(`payments/${bookingId}`);
        const payment = await tx.get(paymentRef);
        const order = await tx.get(db.doc(`bookings/${bookingId}`));
        if (!order.exists || !payment.exists || !canSettle(order.data(), payment.data()))
            return;
        // Commission defaults to zero: no invented fee or withdrawable booking value.
        const net = payment.data().amountMinor;
        const balanceRef = db.doc(`balances/${order.data().sellerId}`);
        tx.set(balanceRef, { availableMinor: FieldValue.increment(net), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
        tx.update(paymentRef, { released: true, releasedMinor: net, releasedAt: FieldValue.serverTimestamp() });
    });
}
export const payhereNotify = onRequest({ ...options, secrets: [secret] }, async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("POST required");
        return;
    }
    const body = req.body;
    if (!body || !validNotification(body, merchant.value(), secret.value())) {
        res.status(400).send("Invalid signature");
        return;
    }
    try {
        const bookingId = id(body.order_id);
        await db.runTransaction(async (tx) => {
            const ref = db.doc(`payments/${bookingId}`);
            const snap = await tx.get(ref);
            if (!snap.exists || snap.data().amountMinor !== toMinor(body.payhere_amount))
                throw new Error("Payment amount mismatch");
            if (snap.data().status === "paid") {
                if (["-2", "-3"].includes(body.status_code)) {
                    if (snap.data().released)
                        tx.set(db.doc(`balances/${snap.data().sellerId}`), { availableMinor: FieldValue.increment(-snap.data().releasedMinor), riskHold: true }, { merge: true });
                    tx.update(ref, { status: "reversed", released: false, reversalCode: body.status_code, updatedAt: FieldValue.serverTimestamp() });
                }
                return; // Duplicate or out-of-order notifications cannot double-credit.
            }
            if (snap.data().status === "reversed")
                return;
            tx.update(ref, { status: body.status_code === "2" ? "paid" : body.status_code === "0" ? "pending" : "failed", providerPaymentId: String(body.payment_id ?? ""), providerStatus: String(body.status_code), updatedAt: FieldValue.serverTimestamp() });
        });
        await releaseFunds(bookingId);
        res.status(200).send("OK");
    }
    catch {
        res.status(400).send("Payment could not be verified");
    }
});
export const settleCompletedBooking = onDocumentWritten({ ...options, database: "needlyy", document: "bookings/{bookingId}" }, async (event) => {
    if (event.data?.after.exists)
        await releaseFunds(event.params.bookingId);
});
export const confirmCashPayment = onCall(options, async (request) => {
    const user = await actor(request);
    const bookingId = id(request.data?.bookingId);
    await db.runTransaction(async (tx) => {
        const order = await tx.get(db.doc(`bookings/${bookingId}`));
        const ref = db.doc(`payments/${bookingId}`);
        const previous = await tx.get(ref);
        if (!order.exists || order.data().sellerId !== user.uid || order.data().status !== "completed")
            throw new HttpsError("permission-denied", "Only the seller can confirm cash received for a completed service.");
        if (previous.data()?.status === "paid")
            throw new HttpsError("already-exists", "Payment is already recorded.");
        if (previous.exists && previous.data().method === "payhere")
            throw new HttpsError("failed-precondition", "An online checkout already exists. Contact support to reconcile it before recording cash.");
        const data = order.data();
        tx.set(ref, { bookingId, buyerId: data.buyerId, sellerId: data.sellerId, serviceTitle: data.serviceTitle, amountMinor: toMinor(data.price), currency: "LKR", method: "cash", status: "paid", released: false, confirmedBy: user.uid, createdAt: FieldValue.serverTimestamp() });
    });
    return { ok: true };
});
export const requestPayout = onCall(options, async (request) => {
    const user = await actor(request);
    if (user.role !== "seller" || !user.verified)
        throw new HttpsError("permission-denied", "Seller verification is required for payouts.");
    const amountMinor = toMinor(request.data?.amount);
    if (amountMinor < 50000)
        throw new HttpsError("invalid-argument", "Minimum payout is Rs. 500.");
    const key = id(request.data?.requestId);
    const payoutRef = db.doc(`payouts/${user.uid}-${key}`);
    const bank = requireText(request.data?.bank);
    const accountNo = requireText(request.data?.accountNo, 50);
    const accountName = requireText(request.data?.accountName);
    const branch = requireText(request.data?.branch);
    await db.runTransaction(async (tx) => {
        const ref = db.doc(`balances/${user.uid}`);
        const balance = await tx.get(ref);
        const existing = await tx.get(payoutRef);
        const disputes = await tx.get(db.collection("disputes").where("sellerId", "==", user.uid));
        if (disputes.docs.some(doc => ["open", "investigating"].includes(doc.data().status)))
            throw new HttpsError("failed-precondition", "Resolve open disputes before requesting a payout.");
        if (existing.exists)
            return;
        if (balance.data()?.payoutHold || balance.data()?.riskHold)
            throw new HttpsError("failed-precondition", "Payouts are on hold pending a dispute or payment review.");
        if ((balance.data()?.availableMinor ?? 0) < amountMinor)
            throw new HttpsError("failed-precondition", "Insufficient cleared payment balance.");
        tx.update(ref, { availableMinor: FieldValue.increment(-amountMinor), reservedMinor: FieldValue.increment(amountMinor) });
        tx.create(payoutRef, { sellerId: user.uid, sellerName: user.name, amountMinor, bank, accountNo, accountName, branch, status: "pending", createdAt: FieldValue.serverTimestamp() });
    });
    return { id: payoutRef.id };
});
export const resolvePayout = onCall(options, async (request) => {
    const user = await actor(request, true);
    const payoutId = id(request.data?.id);
    const status = request.data?.status;
    if (!["paid", "rejected"].includes(status))
        throw new HttpsError("invalid-argument", "Invalid payout status.");
    const reference = requireText(request.data?.reference, 300);
    await db.runTransaction(async (tx) => {
        const ref = db.doc(`payouts/${payoutId}`);
        const snap = await tx.get(ref);
        if (!snap.exists || snap.data().status !== "pending")
            throw new HttpsError("failed-precondition", "This payout has already been reviewed.");
        const data = snap.data();
        const balanceRef = db.doc(`balances/${data.sellerId}`);
        const balance = await tx.get(balanceRef);
        if (status === "paid" && (balance.data()?.payoutHold || balance.data()?.riskHold))
            throw new HttpsError("failed-precondition", "Reconcile the account hold before recording a payout.");
        if ((balance.data()?.reservedMinor ?? 0) < data.amountMinor)
            throw new HttpsError("failed-precondition", "Balance reconciliation required.");
        tx.update(balanceRef, { reservedMinor: FieldValue.increment(-data.amountMinor), ...(status === "rejected" ? { availableMinor: FieldValue.increment(data.amountMinor) } : { paidOutMinor: FieldValue.increment(data.amountMinor) }) });
        tx.update(ref, { status, reference, reviewedBy: user.uid, reviewedAt: FieldValue.serverTimestamp() });
    });
    return { ok: true };
});
export const verificationDocument = onCall(options, async (request) => {
    await actor(request, true);
    const uid = id(request.data?.uid);
    const path = requireText(request.data?.path, 400);
    const snap = await db.doc(`verifications/${uid}`).get();
    if (!path.startsWith(`verifications/${uid}/`) || !snap.data()?.documents?.some(doc => doc.path === path))
        throw new HttpsError("permission-denied", "Document unavailable.");
    const [url] = await getStorage().bucket().file(path).getSignedUrl({ action: "read", expires: Date.now() + 5 * 60 * 1000, responseDisposition: "attachment" });
    return { url };
});
export const syncAccountState = onDocumentWritten({ ...options, database: "needlyy", document: "users/{uid}" }, async (event) => {
    if (!event.data?.after.exists)
        return;
    const profile = event.data.after.data();
    const suspended = profile.status === "suspended";
    const account = await getAuth().getUser(event.params.uid);
    await getAuth().setCustomUserClaims(account.uid, { ...account.customClaims, suspended });
    if (account.disabled !== suspended)
        await getAuth().updateUser(account.uid, { disabled: suspended });
    if (suspended)
        await getAuth().revokeRefreshTokens(account.uid);
    if (suspended || !profile.verified) {
        await db.doc(`emergencyProviders/${event.params.uid}`).delete();
        const hotelRef = db.doc(`hotelProperties/${event.params.uid}`);
        const hotel = await hotelRef.get();
        if (hotel.exists && hotel.data().status === "approved") await hotelRef.update({status:suspended?"suspended":"changes_requested",updatedAt:FieldValue.serverTimestamp()});
    }
    // Keep public listing identity flags consistent with admin verification.
    const services = await db.collection("services").where("sellerId", "==", account.uid).get();
    const writer = db.bulkWriter();
    services.docs.forEach(service => writer.update(service.ref, { sellerName: profile.name, sellerVerified: !!profile.verified, sellerBio: profile.bio ?? "", sellerAvailability: profile.availability ?? "available", sellerPhone: profile.phone ?? "", ...(suspended ? { status: "paused" } : {}) }));
    await writer.close();
});
export const reviewAggregates = onDocumentWritten({ ...options, database: "needlyy", document: "reviews/{id}" }, async (event) => {
    const data = event.data?.after.data() ?? event.data?.before.data();
    if (!data)
        return;
    const serviceRef = db.doc(`services/${data.serviceId}`);
    await db.runTransaction(async (tx) => {
        const service = await tx.get(serviceRef);
        if (!service.exists)
            return;
        const reviews = await tx.get(db.collection("reviews").where("serviceId", "==", data.serviceId));
        const count = reviews.size;
        const rating = count ? reviews.docs.reduce((sum, review) => sum + review.data().rating, 0) / count : 0;
        tx.update(serviceRef, { rating, reviewCount: count });
    });
});
export const feedCounters = onDocumentWritten({ ...options, database: "needlyy", document: "feedPosts/{postId}/likes/{uid}" }, async (event) => {
    const parent = db.doc(`feedPosts/${event.params.postId}`);
    await db.runTransaction(async (tx) => {
        const post = await tx.get(parent);
        if (!post.exists)
            return;
        const likes = await tx.get(parent.collection("likes"));
        tx.update(parent, { likes: likes.size });
    });
});
export const commentCounters = onDocumentWritten({ ...options, database: "needlyy", document: "feedPosts/{postId}/comments/{id}" }, async (event) => {
    const parent = db.doc(`feedPosts/${event.params.postId}`);
    await db.runTransaction(async (tx) => {
        const post = await tx.get(parent);
        if (!post.exists)
            return;
        const comments = await tx.get(parent.collection("comments"));
        tx.update(parent, { comments: comments.size });
    });
});
export const bookingNotifications = onDocumentWritten({ ...options, database: "needlyy", document: "bookings/{bookingId}" }, async (event) => {
    if (!event.data?.after.exists)
        return;
    const current = event.data.after.data();
    const previous = event.data.before.data();
    if (previous?.status === current.status)
        return;
    const recipients = [...new Set([current.buyerId, current.sellerId])];
    await Promise.all(recipients.map(async (uid) => {
        const profile = await db.doc(`users/${uid}`).get();
        if (profile.data()?.notificationPreferences?.bookingUpdates === false)
            return;
        return db.doc(`users/${uid}/notifications/${event.id}`).set({ type: "booking_confirmed", title: `Booking ${current.status.replaceAll("_", " ")}`, body: current.serviceTitle, link: `/booking/confirm/${event.params.bookingId}`, read: false, createdAt: FieldValue.serverTimestamp() });
    }));
});
export const jobResponseCounts = onDocumentCreated({ ...options, database: "needlyy", document: "jobRequests/{jobId}/responses/{uid}" }, async (event) => {
    const parent = db.doc(`jobRequests/${event.params.jobId}`);
    await db.runTransaction(async (tx) => {
        const job = await tx.get(parent);
        if (!job.exists)
            return;
        const responses = await tx.get(parent.collection("responses"));
        tx.update(parent, { responses: responses.size });
    });
});
export const approveCompletion = onCall(options, async (request) => {
    const user = await actor(request);
    const bookingId = id(request.data?.bookingId);
    await db.runTransaction(async (tx) => {
        const ref = db.doc(`bookings/${bookingId}`);
        const snap = await tx.get(ref);
        if (!snap.exists || snap.data().buyerId !== user.uid || snap.data().status !== "completed")
            throw new HttpsError("permission-denied", "Only the buyer can approve a completed service.");
        if (!snap.data().buyerApprovedAt)
            tx.update(ref, { buyerApprovedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    });
    await releaseFunds(bookingId);
    return { ok: true };
});
export const disputePayoutHold = onDocumentWritten({ ...options, database: "needlyy", document: "disputes/{id}" }, async (event) => {
    const data = event.data?.after.data() ?? event.data?.before.data();
    if (!data?.sellerId)
        return;
    await db.runTransaction(async (tx) => { const disputes = await tx.get(db.collection("disputes").where("sellerId", "==", data.sellerId)); const payoutHold = disputes.docs.some(item => ["open", "investigating"].includes(item.data().status)); tx.set(db.doc(`balances/${data.sellerId}`), { payoutHold }, { merge: true }); });
});
export const messageNotifications = onDocumentCreated({ ...options, database: "needlyy", document: "conversations/{id}/messages/{messageId}" }, async (event) => {
    const message = event.data?.data();
    if (!message)
        return;
    const conversation = (await db.doc(`conversations/${event.params.id}`).get()).data();
    if (!conversation)
        return;
    const uid = message.senderId === conversation.buyerId ? conversation.sellerId : conversation.buyerId;
    const profile = (await db.doc(`users/${uid}`).get()).data();
    if (profile?.notificationPreferences?.messages === false)
        return;
    const role = uid === conversation.buyerId ? "buyer" : "seller";
    await db.doc(`users/${uid}/notifications/${event.id}`).set({ type: "message", title: "New message", body: message.text.slice(0, 200), link: `/dashboard/${role}/inbox?conversation=${event.params.id}`, read: false, createdAt: FieldValue.serverTimestamp() });
});
export const reviewNotifications = onDocumentCreated({ ...options, database: "needlyy", document: "reviews/{id}" }, async (event) => {
    const review = event.data?.data();
    if (!review)
        return;
    const profile = (await db.doc(`users/${review.sellerId}`).get()).data();
    if (profile?.notificationPreferences?.reviews === false)
        return;
    await db.doc(`users/${review.sellerId}/notifications/${event.id}`).set({ type: "review", title: "New service review", body: `${review.author} left a ${review.rating}-star review.`, link: `/service/${review.serviceId}`, read: false, createdAt: FieldValue.serverTimestamp() });
});

export const businessOperations = createBusinessOperations(db, actor);

export const hotelRequestNotifications = onDocumentWritten({ ...options, database: "needlyy", document: "hotelRequests/{id}" }, async event => {
    if (!event.data?.after.exists) return;
    const current = event.data.after.data(), previous = event.data.before.data();
    if (current.status === previous?.status && current.quoteVersion === previous?.quoteVersion) return;
    await Promise.all([...new Set([current.buyerId,current.ownerId])].map(async uid => {
        const profile = (await db.doc(`users/${uid}`).get()).data();
        if (profile?.notificationPreferences?.bookingUpdates === false) return;
        await db.doc(`users/${uid}/notifications/${event.id}`).set({type:"booking_new",title:`Hotel enquiry ${current.status}`,body:current.propertyName,link:uid===current.ownerId?"/dashboard/hotel/requests":"/dashboard/buyer/hotels",read:false,createdAt:FieldValue.serverTimestamp()});
    }));
});

export const businessReviewNotifications = onDocumentWritten({ ...options, database: "needlyy", document: "businessReviews/{id}" }, async event => {
    const current = event.data?.after.data();
    if (!current) return;
    await db.doc(`users/${current.ownerId}/notifications/${event.id}`).set({type:"review",title:`${current.kind === "hotel" ? "Hotel" : "Urgent-service"} application ${current.status.replaceAll("_"," ")}`,body:current.notes || "Open your business workspace for the review status.",link:current.kind === "hotel"?"/dashboard/hotel/property":"/dashboard/seller/emergency",read:false,createdAt:FieldValue.serverTimestamp()});
});
