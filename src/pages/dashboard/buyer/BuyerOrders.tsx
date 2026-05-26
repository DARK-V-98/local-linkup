import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getBookings, StoredBooking } from "@/lib/store";
import { formatPrice } from "@/lib/format";

const buyerSidebarItems = [
  { label: "Overview", to: "/dashboard/buyer", icon: "fa-house-user" },
  { label: "My Bookings", to: "/dashboard/buyer/orders", icon: "fa-bag-shopping" },
  { label: "Saved Sellers", to: "/dashboard/buyer/saved", icon: "fa-heart" },
  { label: "Payment Methods", to: "/dashboard/buyer/payments", icon: "fa-credit-card" },
  { label: "Account Settings", to: "/dashboard/buyer/settings", icon: "fa-user-gear" },
];

const DEMO_PAST: StoredBooking[] = [
  {
    id: "PAST001", serviceId: "t2", serviceTitle: "Luxury Home Deep Cleaning", category: "Home Services", categoryIcon: "fas fa-gem",
    vendorName: "Nirmala S.", vendorPhone: "+94779876543", vendorInitial: "N", vendorVerified: true,
    customerName: "You", customerPhone: "+94771234567", date: "2026-04-15", time: "09:00",
    notes: "Please bring your own equipment", extraData: {}, price: 8500, district: "Kandy",
    status: "completed", createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: "PAST002", serviceId: "t3", serviceTitle: "A/L Combined Maths Mastery", category: "Tuition", categoryIcon: "fas fa-fire",
    vendorName: "Kasun J.", vendorPhone: "+94766543210", vendorInitial: "K", vendorVerified: true,
    customerName: "You", customerPhone: "+94771234567", date: "2026-03-10", time: "17:00",
    notes: "", extraData: { "Student Level / Grade": "A/L", "Subjects Needed": "Combined Maths" }, price: 4500, district: "Galle",
    status: "completed", createdAt: new Date(Date.now() - 76 * 86400000).toISOString(),
  },
];

const STATUS_CONFIG = {
  pending: { label: "Pending", pill: "bg-amber-100 text-amber-700", icon: "fa-clock" },
  confirmed: { label: "Confirmed", pill: "bg-blue-100 text-blue-700", icon: "fa-circle-check" },
  in_progress: { label: "In Progress", pill: "bg-violet-100 text-violet-700", icon: "fa-spinner" },
  completed: { label: "Completed", pill: "bg-emerald-100 text-emerald-700", icon: "fa-flag-checkered" },
  cancelled: { label: "Cancelled", pill: "bg-red-100 text-red-500", icon: "fa-xmark" },
};

export default function BuyerOrders() {
  const [tab, setTab] = useState<"active" | "history">("active");
  const [bookings, setBookings] = useState<StoredBooking[]>([]);

  useEffect(() => {
    const stored = getBookings();
    setBookings(stored);
  }, []);

  const active = bookings.filter((b) => ["pending", "confirmed", "in_progress"].includes(b.status));
  const history = [...bookings.filter((b) => ["completed", "cancelled"].includes(b.status)), ...DEMO_PAST];
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

                    <div className="flex flex-wrap gap-2 mt-4">
                      <Link
                        to={`/booking/confirm/${b.id}`}
                        className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                      >
                        <i className="fas fa-receipt text-[10px]" /> View Details
                      </Link>
                      {["pending", "confirmed"].includes(b.status) && (
                        <a
                          href={`https://wa.me/${b.vendorPhone.replace(/\D/g, "")}?text=${whatsappMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#25D366]/20 transition"
                        >
                          <i className="fab fa-whatsapp" /> Contact Vendor
                        </a>
                      )}
                      {b.status === "completed" && (
                        <Link
                          to={`/service/${b.serviceId}`}
                          className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-primary/20 transition"
                        >
                          <i className="fas fa-rotate-right text-[10px]" /> Book Again
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
