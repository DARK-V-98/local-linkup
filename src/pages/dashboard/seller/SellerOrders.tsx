import { useState, useEffect } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getBookings, updateBookingStatus, StoredBooking } from "@/lib/store";
import { formatPrice } from "@/lib/format";
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
    status: "completed", createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

type TabKey = "all" | "pending" | "confirmed" | "completed" | "cancelled";

const TAB_CONFIG: Record<TabKey, { label: string; color: string }> = {
  all: { label: "All", color: "text-slate-600" },
  pending: { label: "Pending", color: "text-amber-600" },
  confirmed: { label: "Confirmed", color: "text-blue-600" },
  completed: { label: "Completed", color: "text-emerald-600" },
  cancelled: { label: "Cancelled", color: "text-red-500" },
};

const STATUS_PILL: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-violet-100 text-violet-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function SellerOrders() {
  const [tab, setTab] = useState<TabKey>("all");
  const [orders, setOrders] = useState<StoredBooking[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    const labels: Record<string, string> = { confirmed: "Order accepted!", completed: "Marked as completed!", cancelled: "Order declined." };
    toast.success(labels[status] ?? "Status updated.");
  };

  const displayed = orders.filter((o) => tab === "all" || o.status === tab);

  return (
    <DashboardShell role="Verified Seller" sidebarItems={sellerSidebarItems}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Orders</h1>
          <p className="text-slate-500 text-sm">Manage incoming and active bookings.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5">
          <i className="fas fa-bell text-amber-500" />
          <span className="text-xs font-bold text-amber-700">
            {orders.filter((o) => o.status === "pending").length} new order{orders.filter((o) => o.status === "pending").length !== 1 ? "s" : ""} waiting
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-2xl w-full sm:w-fit overflow-x-auto">
        {(Object.keys(TAB_CONFIG) as TabKey[]).map((t) => {
          const count = t === "all" ? orders.length : orders.filter((o) => o.status === t).length;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {TAB_CONFIG[t].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders */}
      {displayed.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <i className="fas fa-inbox text-5xl text-slate-200 mb-4" />
          <h3 className="text-lg font-black text-slate-400">No orders here yet</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((o) => {
            const isExpanded = expandedId === o.id;
            const created = new Date(o.createdAt);
            return (
              <div key={o.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-primary/30 transition">
                {/* Order header */}
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
                      <div className="text-xs text-slate-500 font-semibold mt-0.5">
                        Booked by <span className="font-black text-slate-700">{o.customerName}</span>
                        <span className="text-slate-300 mx-1.5">·</span>
                        {o.date}{o.time ? ` at ${o.time}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${STATUS_PILL[o.status]}`}>{o.status}</span>
                    <span className="font-black text-slate-900">{formatPrice(o.price)}</span>
                    <i className={`fas fa-chevron-${isExpanded ? "up" : "down"} text-slate-400 text-xs`} />
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50/50">
                    <div className="grid sm:grid-cols-2 gap-4 mb-5">
                      {[
                        { icon: "fa-user", label: "Customer", val: o.customerName },
                        { icon: "fa-phone", label: "Phone", val: o.customerPhone },
                        { icon: "fa-calendar", label: "Date", val: o.date },
                        { icon: "fa-clock", label: "Time", val: o.time || "Not specified" },
                        { icon: "fa-location-dot", label: "District", val: o.district },
                        { icon: "fa-hashtag", label: "Booking ID", val: o.id },
                      ].map((r) => (
                        <div key={r.label} className="flex items-start gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 grid place-items-center shrink-0">
                            <i className={`fas ${r.icon} text-[10px] text-slate-400`} />
                          </span>
                          <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">{r.label}</div>
                            <div className="text-sm font-bold text-slate-900">{r.val}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {o.notes && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-800">
                        <i className="fas fa-note-sticky mr-2" />{o.notes}
                      </div>
                    )}

                    {Object.keys(o.extraData ?? {}).length > 0 && (
                      <div className="mb-4 space-y-1.5">
                        {Object.entries(o.extraData).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-sm">
                            <span className="text-slate-500 font-semibold">{k}</span>
                            <span className="font-bold text-slate-900">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <a
                        href={`https://wa.me/${o.customerPhone.replace(/\D/g, "")}?text=Hi ${o.customerName}, I'm confirming your Needly booking (${o.id}) for ${o.serviceTitle} on ${o.date}.`}
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
                            <i className="fas fa-check" /> Accept Order
                          </button>
                          <button
                            onClick={() => changeStatus(o.id, "cancelled")}
                            className="flex items-center gap-1.5 bg-red-50 text-red-500 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition"
                          >
                            <i className="fas fa-xmark" /> Decline
                          </button>
                        </>
                      )}

                      {o.status === "confirmed" && (
                        <button
                          onClick={() => changeStatus(o.id, "completed")}
                          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary/90 transition"
                        >
                          <i className="fas fa-flag-checkered" /> Mark Completed
                        </button>
                      )}
                    </div>
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
