import { useState, useEffect } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getBookings, updateBookingStatus, StoredBooking } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { usePageTitle } from "@/lib/usePageTitle";
import { toast } from "sonner";

const sellerSidebarItems = [
  { label: "Overview", to: "/dashboard/seller", icon: "fa-chart-line" },
  { label: "My Services", to: "/dashboard/seller/services", icon: "fa-briefcase" },
  { label: "Orders", to: "/dashboard/seller/orders", icon: "fa-cart-flatbed" },
  { label: "Earnings", to: "/dashboard/seller/earnings", icon: "fa-wallet" },
  { label: "Settings", to: "/dashboard/seller/settings", icon: "fa-user-gear" },
];

const DEMO_ORDERS: StoredBooking[] = [
  {
    id: "BK001", serviceId: "t1", serviceTitle: "Premium WordPress Website Development", category: "Technology", categoryIcon: "fas fa-laptop-code",
    vendorName: "Tharindu P.", vendorPhone: "+94771234567", vendorInitial: "T", vendorVerified: true,
    customerName: "Priya Madhushani", customerPhone: "+94771111111", date: "2026-05-28", time: "10:00",
    notes: "Need it completed before June 15th", extraData: { "Project Brief": "E-commerce site for clothing store" }, price: 25000, district: "Colombo",
    status: "pending", createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: "BK002", serviceId: "l2", serviceTitle: "AC Repair & Servicing", category: "Repairs", categoryIcon: "fas fa-snowflake",
    vendorName: "Ravi M.", vendorPhone: "+94762222222", vendorInitial: "R", vendorVerified: false,
    customerName: "Suresh Bandara", customerPhone: "+94762222222", date: "2026-05-27", time: "14:00",
    notes: "", extraData: {}, price: 3500, district: "Colombo",
    status: "confirmed", createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "BK003", serviceId: "l7", serviceTitle: "Car Full Detailing", category: "Vehicle Service", categoryIcon: "fas fa-car-side",
    vendorName: "Pradeep N.", vendorPhone: "+94777777777", vendorInitial: "P", vendorVerified: true,
    customerName: "Dilani Fernando", customerPhone: "+94773333333", date: "2026-05-23", time: "09:00",
    notes: "Sedan, dark blue", extraData: { "Vehicle Make & Model": "Toyota Axio 2017", "Registration Number": "CAF-8821" }, price: 9500, district: "Colombo",
    status: "in_progress", createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "BK004", serviceId: "t2", serviceTitle: "Luxury Home Deep Cleaning", category: "Home Services", categoryIcon: "fas fa-gem",
    vendorName: "Tharindu P.", vendorPhone: "+94771234567", vendorInitial: "T", vendorVerified: true,
    customerName: "Kavinda Rajapaksa", customerPhone: "+94774444444", date: "2026-05-10", time: "08:00",
    notes: "", extraData: {}, price: 8500, district: "Kandy",
    status: "completed", createdAt: new Date(Date.now() - 16 * 86400000).toISOString(),
  },
];

type TabKey = "all" | "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

const TAB_CONFIG: Record<TabKey, { label: string; icon: string; color: string }> = {
  all: { label: "All", icon: "fa-list", color: "text-slate-600" },
  pending: { label: "Pending", icon: "fa-clock", color: "text-amber-600" },
  confirmed: { label: "Confirmed", icon: "fa-circle-check", color: "text-blue-600" },
  in_progress: { label: "In Progress", icon: "fa-spinner", color: "text-violet-600" },
  completed: { label: "Completed", icon: "fa-flag-checkered", color: "text-emerald-600" },
  cancelled: { label: "Cancelled", icon: "fa-xmark", color: "text-red-500" },
};

const STATUS_PILL: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-violet-100 text-violet-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function SellerOrders() {
  usePageTitle("My Orders");
  const [tab, setTab] = useState<TabKey>("all");
  const [orders, setOrders] = useState<StoredBooking[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const refresh = () => {
    const stored = getBookings();
    setOrders([...DEMO_ORDERS, ...stored]);
  };

  useEffect(() => { refresh(); }, []);

  const changeStatus = (id: string, status: StoredBooking["status"]) => {
    if (!id.startsWith("BK0")) {
      updateBookingStatus(id, status);
    }
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    const labels: Record<string, string> = {
      confirmed: "Order accepted! Customer notified.",
      in_progress: "Work started — customer knows you're on it.",
      completed: "Order marked as completed!",
      cancelled: "Order declined.",
    };
    toast.success(labels[status] ?? "Status updated.");
  };

  const handleDecline = (id: string) => {
    changeStatus(id, "cancelled");
    setDecliningId(null);
    setDeclineReason("");
  };

  // Stats
  const pending = orders.filter((o) => o.status === "pending").length;
  const inProgress = orders.filter((o) => o.status === "in_progress").length;
  const completedThisWeek = orders.filter((o) => {
    const d = new Date(o.createdAt);
    return o.status === "completed" && Date.now() - d.getTime() < 7 * 86400000;
  });
  const weekRevenue = completedThisWeek.reduce((a, o) => a + o.price, 0);

  const displayed = orders
    .filter((o) => tab === "all" || o.status === tab)
    .filter((o) => {
      const q = search.toLowerCase();
      return !q || o.customerName.toLowerCase().includes(q) || o.serviceTitle.toLowerCase().includes(q);
    });

  return (
    <DashboardShell role="Verified Seller" sidebarItems={sellerSidebarItems}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm">Manage incoming and active bookings.</p>
        </div>
        {pending > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5 animate-pulse">
            <i className="fas fa-bell text-amber-500" />
            <span className="text-xs font-bold text-amber-700">
              {pending} new order{pending !== 1 ? "s" : ""} need your response
            </span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Orders", val: orders.length, icon: "fa-cart-flatbed", color: "text-blue-600 bg-blue-50" },
          { label: "Pending Response", val: pending, icon: "fa-clock", color: "text-amber-600 bg-amber-50" },
          { label: "In Progress", val: inProgress, icon: "fa-hammer", color: "text-violet-600 bg-violet-50" },
          { label: "Week Revenue", val: formatPrice(weekRevenue), icon: "fa-wallet", color: "text-emerald-600 bg-emerald-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <span className={`w-9 h-9 rounded-xl ${s.color} grid place-items-center shrink-0`}>
              <i className={`fas ${s.icon} text-xs`} />
            </span>
            <div>
              <div className="text-base font-black text-slate-900">{s.val}</div>
              <div className="text-[10px] text-slate-400 font-bold leading-tight">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Tabs row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative sm:w-64">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or service…"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto flex-1">
          {(Object.keys(TAB_CONFIG) as TabKey[]).map((t) => {
            const count = t === "all" ? orders.length : orders.filter((o) => o.status === t).length;
            const cfg = TAB_CONFIG[t];
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <i className={`fas ${cfg.icon} text-[10px] ${tab === t ? cfg.color : ""}`} />
                {cfg.label}
                {count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${tab === t ? "bg-slate-100" : "bg-white"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders list */}
      {displayed.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <i className="fas fa-inbox text-5xl text-slate-200 mb-4" />
          <h3 className="text-lg font-black text-slate-400">
            {search ? "No orders match your search" : "No orders here yet"}
          </h3>
          {search && (
            <button onClick={() => setSearch("")} className="mt-3 text-sm font-bold text-primary hover:underline">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((o) => {
            const isExpanded = expandedId === o.id;
            const isDeclining = decliningId === o.id;

            return (
              <div key={o.id} className={`bg-white border rounded-3xl overflow-hidden transition ${isExpanded ? "border-primary/30 shadow-soft" : "border-slate-200 hover:border-slate-300"}`}>
                {/* Order header row */}
                <div
                  className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : o.id)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 grid place-items-center shrink-0">
                      <i className={`${o.categoryIcon} text-slate-400 text-lg`} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 truncate">{o.serviceTitle}</div>
                      <div className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                        <span className="font-black text-slate-700">{o.customerName}</span>
                        <span className="text-slate-300">·</span>
                        <i className="fas fa-calendar text-primary text-[9px]" />
                        {o.date}{o.time ? ` at ${o.time}` : ""}
                        <span className="text-slate-300">·</span>
                        {o.district}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${STATUS_PILL[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                    <span className="font-black text-slate-900">{formatPrice(o.price)}</span>
                    <i className={`fas fa-chevron-${isExpanded ? "up" : "down"} text-slate-400 text-xs`} />
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50/50">
                    {/* Info grid */}
                    <div className="grid sm:grid-cols-3 gap-3 mb-5">
                      {[
                        { icon: "fa-user", label: "Customer", val: o.customerName },
                        { icon: "fa-phone", label: "Phone", val: o.customerPhone },
                        { icon: "fa-hashtag", label: "Booking ID", val: o.id },
                        { icon: "fa-calendar", label: "Date", val: o.date },
                        { icon: "fa-clock", label: "Time", val: o.time || "Not specified" },
                        { icon: "fa-location-dot", label: "District", val: o.district },
                      ].map((r) => (
                        <div key={r.label} className="flex items-start gap-2.5 bg-white rounded-xl p-3 border border-slate-100">
                          <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                            <i className={`fas ${r.icon} text-[10px]`} />
                          </span>
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">{r.label}</div>
                            <div className="text-sm font-bold text-slate-900">{r.val}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {o.notes && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800 flex items-start gap-2">
                        <i className="fas fa-note-sticky mt-0.5" />
                        <span>{o.notes}</span>
                      </div>
                    )}

                    {Object.keys(o.extraData ?? {}).length > 0 && (
                      <div className="mb-4 bg-white border border-slate-100 rounded-xl p-4 space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Additional Details</p>
                        {Object.entries(o.extraData).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-sm">
                            <span className="text-slate-500 font-semibold">{k}</span>
                            <span className="font-bold text-slate-900">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status pipeline indicator */}
                    <div className="mb-5 flex items-center gap-1">
                      {(["pending", "confirmed", "in_progress", "completed"] as const).map((step, i) => {
                        const steps = ["pending", "confirmed", "in_progress", "completed"];
                        const currentIdx = steps.indexOf(o.status);
                        const stepIdx = steps.indexOf(step);
                        const isDone = stepIdx < currentIdx || o.status === step;
                        const isCurrent = o.status === step;
                        return (
                          <div key={step} className="flex items-center flex-1 last:flex-none">
                            <div className={`flex items-center gap-1 text-[10px] font-bold ${isCurrent ? "text-primary" : isDone ? "text-emerald-500" : "text-slate-300"}`}>
                              <span className={`w-5 h-5 rounded-full grid place-items-center border-2 shrink-0 ${isCurrent ? "border-primary bg-primary text-white" : isDone ? "border-emerald-400 bg-emerald-400 text-white" : "border-slate-200"}`}>
                                {isDone && !isCurrent ? <i className="fas fa-check text-[8px]" /> : i + 1}
                              </span>
                              <span className="hidden sm:block capitalize">{step.replace("_", " ")}</span>
                            </div>
                            {i < 3 && <div className={`h-px flex-1 mx-1 ${stepIdx < currentIdx ? "bg-emerald-300" : "bg-slate-200"}`} />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Decline input (shown when declining) */}
                    {isDeclining && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3">
                        <p className="text-sm font-bold text-red-700">
                          <i className="fas fa-triangle-exclamation mr-1.5" />
                          Confirm decline — this will notify the customer
                        </p>
                        <textarea
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          placeholder="Reason for declining (optional, sent to customer)…"
                          rows={2}
                          className="w-full bg-white border border-red-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDecline(o.id)}
                            className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition"
                          >
                            <i className="fas fa-xmark" /> Confirm Decline
                          </button>
                          <button
                            onClick={() => { setDecliningId(null); setDeclineReason(""); }}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                          >
                            Keep Order
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    {!isDeclining && (
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`https://wa.me/${o.customerPhone.replace(/\D/g, "")}?text=Hi ${o.customerName}, this is regarding your Needly booking (${o.id}) for ${o.serviceTitle}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#25D366]/20 transition"
                        >
                          <i className="fab fa-whatsapp text-sm" /> WhatsApp
                        </a>

                        {o.status === "pending" && (
                          <>
                            <button
                              onClick={() => changeStatus(o.id, "confirmed")}
                              className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition"
                            >
                              <i className="fas fa-check" /> Accept
                            </button>
                            <button
                              onClick={() => { setDecliningId(o.id); setDeclineReason(""); }}
                              className="flex items-center gap-1.5 bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition"
                            >
                              <i className="fas fa-xmark" /> Decline
                            </button>
                          </>
                        )}

                        {o.status === "confirmed" && (
                          <button
                            onClick={() => changeStatus(o.id, "in_progress")}
                            className="flex items-center gap-1.5 bg-violet-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-violet-600 transition"
                          >
                            <i className="fas fa-hammer" /> Start Work
                          </button>
                        )}

                        {o.status === "in_progress" && (
                          <button
                            onClick={() => changeStatus(o.id, "completed")}
                            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary/90 transition"
                          >
                            <i className="fas fa-flag-checkered" /> Mark Complete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
