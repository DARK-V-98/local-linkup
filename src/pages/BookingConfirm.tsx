import AppShell from "@/components/layout/AppShell";
import OrderTimeline from "@/components/OrderTimeline";
import { callWorkflow, type Payment } from "@/hooks/usePayments";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { subscribeToBooking, type FirestoreBooking } from "@/lib/firestore/bookings";
import { addDisputeMessage, raiseDispute, subscribeBookingDisputes, type FSDispute } from "@/lib/firestore/disputes";
import { tsToIso } from "@/lib/firestore/normalize";
import { formatPrice } from "@/lib/format";
import { openPayHereCheckout } from "@/lib/payhere";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
export default function BookingConfirm() {
    const { id } = useParams();
    const [booking, setBooking] = useState<FirestoreBooking | null>(null);
    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [dispute, setDispute] = useState("");
    const user = getUser();
    const [disputes, setDisputes] = useState<FSDispute[]>([]);
    const [replies, setReplies] = useState<Record<string, string>>({});
    useEffect(() => {
        if (!id || !user || !booking)
            return;
        return subscribeBookingDisputes(id, user.id, user.id === booking.sellerId ? "seller" : "buyer", setDisputes, () => toast.error("Could not load dispute updates."));
    }, [id, user?.id, booking?.sellerId]);
    useEffect(() => {
        if (!id)
            return;
        setLoading(true);
        setBooking(null);
        setPayment(null);
        const stop = subscribeToBooking(id, data => { setBooking(data); setLoading(false); }, () => { setLoading(false); setError("Could not load this booking. Check your connection and access."); });
        const stopPayment = onSnapshot(doc(db, "payments", id), snap => setPayment(snap.exists() ? { ...snap.data(), id: snap.id } as Payment : null), () => { });
        return () => { stop(); stopPayment(); };
    }, [id]);
    const checkout = async () => {
        if (!booking || !user)
            return;
        setBusy(true);
        try {
            await openPayHereCheckout({ orderId: booking.id, amount: booking.price * 100, description: booking.serviceTitle, customerName: user.name, customerEmail: user.email, customerPhone: user.phone, district: booking.district, onSuccess: () => { setBusy(false); toast.info("Checkout finished. Waiting for the payment provider to verify payment."); }, onDismissed: () => setBusy(false), onError: error => { setBusy(false); toast.error(error); } });
        }
        catch (error) {
            setBusy(false);
            toast.error(error instanceof Error ? error.message : "Could not start checkout.");
        }
    };
    if (loading)
        return <AppShell><p role="status">Loading booking…</p></AppShell>;
    if (!booking)
        return <AppShell><p role="alert">{error || "Booking not found or unavailable."}</p><Link to="/dashboard/buyer/orders">Your bookings</Link></AppShell>;
    const isBuyer = user?.id === booking.buyerId;
    const isSeller = user?.id === booking.sellerId;
    return <AppShell><div className="max-w-3xl mx-auto space-y-6 py-8">
    <div><p className="text-sm text-slate-500 break-all">Booking #{booking.id}</p><h1 className="text-3xl font-black mt-2">{booking.serviceTitle}</h1><p className="mt-2">{booking.status.replace(/_/g, " ")} · {formatPrice(booking.price)}</p></div>
    <section className="rounded-3xl border bg-card p-6 grid sm:grid-cols-2 gap-5">{[{ label: "Seller", value: booking.vendorName }, { label: "Buyer", value: booking.customerName }, { label: "Date & time", value: `${booking.date} ${booking.time}` }, { label: "District", value: booking.district }, { label: "Contact", value: isBuyer ? booking.vendorPhone : booking.customerPhone }, { label: "Notes", value: booking.notes }].map(row => <div key={row.label}><p className="text-xs uppercase font-bold text-slate-500">{row.label}</p><p className="mt-1 break-words">{row.value || "—"}</p></div>)}{Object.entries(booking.extraData ?? {}).map(([key, value]) => <div key={key}><p className="text-xs font-bold text-slate-500">{key}</p><p className="break-words">{value}</p></div>)}</section>
    {isBuyer && booking.status === "completed" && !booking.buyerApprovedAt && <section className="rounded-3xl border bg-card p-6 space-y-3"><h2 className="text-xl font-black">Approve completed service</h2><p className="text-sm text-slate-500">Approve after checking the work. This makes a verified online payment available for the seller's payout. Raise a dispute below if there is an issue.</p><button disabled={busy} className="rounded-xl bg-primary text-primary-foreground p-3 font-bold" onClick={async () => {
                setBusy(true);
                try {
                    await callWorkflow("approveCompletion", { bookingId: booking.id });
                    toast.success("Service delivery approved.");
                }
                catch (error) {
                    toast.error(error instanceof Error ? error.message : "Could not approve completion.");
                }
                finally {
                    setBusy(false);
                }
            }}>Approve service delivery</button></section>}
    <OrderTimeline booking={{ ...booking, createdAt: tsToIso(booking.createdAt) }}/>
    <section className="rounded-3xl border bg-card p-6 space-y-4"><h2 className="text-xl font-black">Payment</h2><p>{payment?.status === "paid" ? `Verified ${payment.test ? "test " : ""}${payment.method} payment: ${formatPrice(payment.amountMinor / 100)}` : payment ? `Payment status: ${payment.status}` : "No payment recorded."}</p>
      {isBuyer && payment?.status !== "paid" && ["confirmed", "in_progress", "completed"].includes(booking.status) && <button disabled={busy} onClick={() => void checkout()} className="rounded-xl bg-primary text-primary-foreground px-5 py-3 font-bold disabled:opacity-50">{busy ? "Opening checkout…" : "Pay with PayHere"}</button>}
      {booking.status === "pending" && <p className="text-sm text-slate-500">The seller must accept your request before online payment.</p>}
      {isSeller && booking.status === "completed" && payment?.status !== "paid" && <button disabled={busy} onClick={async () => {
                setBusy(true);
                try {
                    await callWorkflow("confirmCashPayment", { bookingId: booking.id });
                    toast.success("Cash received recorded.");
                }
                catch (error) {
                    toast.error(error instanceof Error ? error.message : "Could not record payment.");
                }
                finally {
                    setBusy(false);
                }
            }} className="border rounded-xl p-3 font-bold">Confirm cash received directly</button>}
      <p className="text-sm text-slate-500">Cash is recorded after completion by the seller. A checkout callback alone never marks a payment paid.</p>
    </section>
    {isBuyer && <form className="rounded-3xl border bg-card p-6 space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                    await raiseDispute({ orderId: booking.id, type: "other", buyerId: booking.buyerId, buyerName: booking.customerName, sellerId: booking.sellerId, sellerName: booking.vendorName, service: booking.serviceTitle, amount: booking.price, description: dispute });
                    setDispute("");
                    toast.success("Your dispute is saved for admin review.");
                }
                catch (error) {
                    toast.error(error instanceof Error ? error.message : "Could not submit the dispute.");
                }
                finally {
                    setBusy(false);
                }
            }}><h2 className="text-xl font-black">Need help with this booking?</h2><textarea aria-label="Describe your issue" required minLength={10} maxLength={5000} value={dispute} onChange={e => setDispute(e.target.value)} placeholder="Describe your issue" className="w-full rounded-xl border p-3"/><button disabled={busy} className="border rounded-xl p-3 font-bold">Raise a dispute</button></form>}
    {disputes.map(item => <section key={item.id} className="border rounded-3xl p-6 space-y-4"><h2 className="font-black">Support dispute · {item.status}</h2><p>{item.description}</p>{item.messages.map((message, index) => <p key={index} className="bg-slate-50 p-3 rounded-xl"><strong className="capitalize">{message.from}: </strong>{message.text}</p>)}{item.resolution && <p>Resolution: {item.resolution}</p>}<form className="flex flex-wrap gap-3" onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                    await addDisputeMessage(item.id, { from: isBuyer ? "buyer" : "seller", text: replies[item.id].trim(), at: new Date().toISOString() });
                    setReplies({ ...replies, [item.id]: "" });
                }
                catch {
                    toast.error("Could not send dispute reply.");
                }
                finally {
                    setBusy(false);
                }
            }}><input required maxLength={2000} aria-label="Dispute reply" placeholder="Reply to support" className="border rounded-xl p-3 flex-1 min-w-0" value={replies[item.id] ?? ""} onChange={e => setReplies({ ...replies, [item.id]: e.target.value })}/><button disabled={busy} className="border rounded-xl p-3 font-bold">Send reply</button></form></section>)}
    <Link to={isSeller ? "/dashboard/seller/orders" : "/dashboard/buyer/orders"} className="inline-block text-primary font-bold">Back to orders</Link>
  </div></AppShell>;
}
