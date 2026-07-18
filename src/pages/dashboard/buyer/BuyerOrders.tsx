import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getBookings, updateBookingStatus, StoredBooking } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { usePageTitle } from "@/lib/usePageTitle";
import { toast } from "sonner";
import ReviewModal from "@/components/ReviewModal";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToBookingsByBuyer } from "@/lib/firestore/bookings";
import { tsToIso } from "@/lib/firestore/normalize";
import { getUser } from "@/lib/auth";

const buyerSidebarItems = [
  { label: "Overview", to: "/dashboard/buyer", icon: "fa-house-user" },
  { label: "My Bookings", to: "/dashboard/buyer/orders", icon: "fa-bag-shopping" },
  { label: "Saved Sellers", to: "/dashboard/buyer/saved", icon: "fa-heart" },
  { label: "Payments", to: "/dashboard/buyer/payments", icon: "fa-credit-card" },
  { label: "Settings", to: "/dashboard/buyer/settings", icon: "fa-user-gear" },
];


const STATUS_CONFIG = {
  pending: { label: "Pending", pill: "bg-amber-100 text-amber-700", icon: "fa-clock" },
  confirmed: { label: "Confirmed", pill: "bg-blue-100 text-blue-700", icon: "fa-circle-check" },
  in_progress: { label: "In Progress", pill: "bg-violet-100 text-violet-700", icon: "fa-spinner" },
  completed: { label: "Completed", pill: "bg-emerald-100 text-emerald-700", icon: "fa-flag-checkered" },
  cancelled: { label: "Cancelled", pill: "bg-red-100 text-red-500", icon: "fa-xmark" },
};

export default function BuyerOrders() {
  usePageTitle("My Bookings");
  const [tab, setTab] = useState<"active" | "history">("active");
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [reviewTarget, setReviewTarget] = useState<StoredBooking | null>(null);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    // Use real-time Firestore listener when Firebase is configured and user is not a demo account
    if (isFirebaseConfigured && user) {
      const unsub = subscribeToBookingsByBuyer(user.id, (firestoreBookings) => {
        // Merge Firestore bookings with localStorage (Firestore takes precedence)
        const local = getBookings();
        const fsIds = new Set(firestoreBookings.map((b) => b.id));
        const normalized = firestoreBookings.map((b) => ({ ...b, createdAt: tsToIso(b.createdAt) }));
        const merged = [...normalized, ...local.filter((b) => !fsIds.has(b.id))];
        setBookings(merged);
      });
      return unsub;
    } else {
      setBookings(getBookings());
      // Live cross-tab + same-tab sync for localStorage/demo mode
      const onChange = () => setBookings(getBookings());
      window.addEventListener("needly-bookings-change", onChange);
      let bc: BroadcastChannel | undefined;
      try {
        bc = new BroadcastChannel("needly-sync");
        bc.onmessage = (e) => { if (e.data?.type === "bookings-change") onChange(); };
      } catch { /* BroadcastChannel unsupported */ }
      window.addEventListener("storage", onChange);
      return () => {
        window.removeEventListener("needly-bookings-change", onChange);
        window.removeEventListener("storage", onChange);
        bc?.close();
      };
    }
  }, []);

  const confirmCancel = (id: string) => {
    updateBookingStatus(id, "cancelled");
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "cancelled" } : b));
    setCancelingId(null);
    toast.success("Booking cancelled. A refund will be processed within 3 days.");
  };

  const active = bookings.filter((b) => ["pending", "confirmed", "in_progress"].includes(b.status));
  const history = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));
  const displayed = tab === "active" ? active : history;

  return (
    <DashboardShell role="Premium Buyer" sidebarItems={buyerSidebarItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">My Bookings</h1>
        <p className="text-slate-500 text-sm">Track and manage all your service bookings.</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active", val: active.length, icon: "fa-spinner", color: "text-blue-600 bg-blue-50" },
          { label: "Completed", val: history.filter((b) => b.status === "completed").length, icon: "fa-flag-checkered", color: "text-emerald-600 bg-emerald-50" },
          { label: "Total Spent", val: formatPrice(history.filter((b) => b.status === "completed").reduce((a, b) => a + b.price, 0)), icon: "fa-wallet", color: "text-violet-600 bg-violet-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <span className={`w-9 h-9 rounded-xl ${s.color} grid place-items-center shrink-0`}>
              <i className={`fas ${s.icon} text-xs`} />
            </span>
            <div>
              <div className="text-base font-black text-slate-900">{s.val}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit mb-6">
        <button
          onClick={() => setTab("active")}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${tab === "active" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          Active ({active.length})
        </button>
        <button
          onClick={() => setTab("history")}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition ${tab === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
        >
          History ({history.length})
        </button>
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <i className="fas fa-calendar-xmark text-5xl text-slate-200 mb-4" />
          <h3 className="text-lg font-black text-slate-400">
            {tab === "active" ? "No active bookings" : "No booking history yet"}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {tab === "active" ? "Book a service to see it here." : "Completed bookings will appear here."}
          </p>
          <Link to="/browse" className="mt-5 inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm">
            <i className="fas fa-magnifying-glass" /> Browse Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((b) => {
            const cfg = STATUS_CONFIG[b.status];
            const whatsappMsg = encodeURIComponent(`Hi ${b.vendorName}, I'm following up on my Needly booking (${b.id}) for ${b.serviceTitle} on ${b.date}.`);
            return (
              <div key={b.id} className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-primary/30 transition">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 grid place-items-center shrink-0">
                    <i className={`${b.categoryIcon} text-slate-400 text-lg`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="font-black text-slate-900">{b.serviceTitle}</div>
                        <div className="text-xs text-slate-500 font-semibold mt-0.5">
                          with {b.vendorName}
                          {b.vendorVerified && (
                            <span className="ml-1.5 inline-flex items-center gap-0.5 text-primary">
                              <i className="fas fa-shield-halved text-[9px]" /> Verified
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${cfg.pill}`}>
                        <i className={`fas ${cfg.icon} mr-1`} />{cfg.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500 font-semibold">
                      <span><i className="fas fa-calendar mr-1 text-primary" />{b.date}</span>
                      {b.time && <span><i className="fas fa-clock mr-1 text-primary" />{b.time}</span>}
                      <span><i className="fas fa-location-dot mr-1 text-primary" />{b.district}</span>
                      <span className="ml-auto font-black text-slate-900">{formatPrice(b.price)}</span>
                    </div>

                    {/* Cancel confirmation inline */}
                    {cancelingId === b.id && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-2">
                        <p className="text-xs font-bold text-red-700 flex-1">
                          <i className="fas fa-triangle-exclamation mr-1.5" />
                          Cancel this booking? This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => confirmCancel(b.id)}
                            className="bg-red-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-red-600 transition"
                          >
                            Yes, Cancel
                          </button>
                          <button
                            onClick={() => setCancelingId(null)}
                            className="border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                          >
                            Keep Booking
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-4">
                      <Link
                        to={`/booking/confirm/${b.id}`}
                        className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                      >
                        <i className="fas fa-receipt text-[10px]" /> View Details
                      </Link>
                      {["pending", "confirmed"].includes(b.status) && (
                        <>
                          <a
                            href={`https://wa.me/${b.vendorPhone.replace(/\D/g, "")}?text=${whatsappMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#25D366]/20 transition"
                          >
                            <i className="fab fa-whatsapp" /> Contact Vendor
                          </a>
                          {cancelingId !== b.id && (
                            <button
                              onClick={() => setCancelingId(b.id)}
                              className="flex items-center gap-1.5 bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-red-100 transition"
                            >
                              <i className="fas fa-ban text-[10px]" /> Cancel Booking
                            </button>
                          )}
                        </>
                      )}
                      {b.status === "completed" && (
                        <>
                          <Link
                            to={`/service/${b.serviceId}`}
                            className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-primary/20 transition"
                          >
                            <i className="fas fa-rotate-right text-[10px]" /> Book Again
                          </Link>
                          {!reviewed.has(b.id) ? (
                            <button
                              onClick={() => setReviewTarget(b)}
                              className="flex items-center gap-1.5 bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-amber-100 transition"
                            >
                              <i className="fas fa-star text-[10px]" /> Leave Review
                            </button>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                              <i className="fas fa-circle-check" /> Reviewed
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ReviewModal
        open={!!reviewTarget}
        onClose={() => {
          if (reviewTarget) setReviewed((prev) => new Set(prev).add(reviewTarget.id));
          setReviewTarget(null);
        }}
        vendorName={reviewTarget?.vendorName ?? ""}
        serviceName={reviewTarget?.serviceTitle ?? ""}
        bookingId={reviewTarget?.id ?? ""}
      />
    </DashboardShell>
  );
}
