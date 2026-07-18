import { useState, useEffect, useMemo } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { updateBookingStatus, StoredBooking } from "@/lib/store";
import { useAllBookings } from "@/hooks/useAllBookings";
import { isFirebaseConfigured } from "@/lib/firebase";
import { updateFirestoreBookingStatus } from "@/lib/firestore/bookings";
import { formatPrice } from "@/lib/format";
import { usePageTitle } from "@/lib/usePageTitle";
import { toast } from "sonner";

const adminSidebarItems = [
  { label: "Overview", to: "/admin", icon: "fa-chart-pie" },
  { label: "Orders", to: "/admin/orders", icon: "fa-cart-flatbed" },
  { label: "Payments", to: "/admin/payments", icon: "fa-money-bill-wave" },
  { label: "Verifications", to: "/admin/verifications", icon: "fa-user-check" },
  { label: "User Management", to: "/admin/users", icon: "fa-users" },
  { label: "Sellers", to: "/admin/sellers", icon: "fa-store" },
  { label: "Service Catalog", to: "/admin/services", icon: "fa-layer-group" },
  { label: "Categories", to: "/admin/categories", icon: "fa-tags" },
  { label: "Disputes", to: "/admin/disputes", icon: "fa-circle-exclamation" },
  { label: "System Settings", to: "/admin/settings", icon: "fa-gears" },
];

type TabKey = "all" | "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

const STATUS_PILL: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-violet-100 text-violet-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-500",
};

function exportCSV(orders: StoredBooking[]) {
  const header = ["ID", "Service", "Category", "Customer", "Vendor", "Date", "Price", "District", "Status", "Created"];
  const rows = orders.map((o) => [
    o.id, `"${o.serviceTitle}"`, o.category, o.customerName, o.vendorName,
    o.date, o.price, o.district, o.status, o.createdAt.split("T")[0],
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `needly_orders_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminOrders() {
  usePageTitle("Orders — Admin");
  const { bookings: orders, loading } = useAllBookings();
  const [tab, setTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);


  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    completed: orders.filter((o) => o.status === "completed").length,
    revenue: orders.filter((o) => o.status === "completed").reduce((s, o) => s + o.price, 0),
    platformFee: orders.filter((o) => o.status === "completed").reduce((s, o) => s + Math.round(o.price * 0.1), 0),
  }), [orders]);

  const districts = useMemo(() => ["All", ...Array.from(new Set(orders.map((o) => o.district)))], [orders]);

  const displayed = useMemo(() =>
    orders.filter((o) => {
      if (tab !== "all" && o.status !== tab) return false;
      if (districtFilter !== "All" && o.district !== districtFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return o.customerName.toLowerCase().includes(q) ||
          o.vendorName.toLowerCase().includes(q) ||
          o.serviceTitle.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q);
      }
      return true;
    })
  , [orders, tab, search, districtFilter]);

  const changeStatus = async (id: string, status: StoredBooking["status"]) => {
    try {
      if (isFirebaseConfigured) {
        // The snapshot listener refreshes the row once the write lands.
        await updateFirestoreBookingStatus(id, status);
      } else {
        updateBookingStatus(id, status);
      }
      toast.success("Status updated.");
    } catch {
      toast.error("Could not update this order.");
    }
  };

  return (
    <DashboardShell role="System Admin" sidebarItems={adminSidebarItems}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">All Orders</h1>
          <p className="text-slate-500 text-sm">Platform-wide booking management.</p>
        </div>
        <button onClick={() => exportCSV(displayed)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-slate-800 transition">
          <i className="fas fa-download" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Orders", val: stats.total, icon: "fa-cart-flatbed", color: "text-blue-600 bg-blue-50" },
          { label: "Pending", val: stats.pending, icon: "fa-clock", color: "text-amber-600 bg-amber-50" },
          { label: "Completed", val: stats.completed, icon: "fa-flag-checkered", color: "text-emerald-600 bg-emerald-50" },
          { label: "GMV", val: formatPrice(stats.revenue), icon: "fa-coins", color: "text-violet-600 bg-violet-50" },
          { label: "Platform Revenue", val: formatPrice(stats.platformFee), icon: "fa-money-bill-wave", color: "text-rose-600 bg-rose-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <span className={`w-9 h-9 rounded-xl ${s.color} grid place-items-center shrink-0`}>
              <i className={`fas ${s.icon} text-xs`} />
            </span>
            <div>
              <div className="text-sm font-black text-slate-900">{s.val}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase leading-tight">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative sm:w-64">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders…"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold focus:outline-none">
          {districts.map((d) => <option key={d}>{d}</option>)}
        </select>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto flex-1">
          {(["all", "pending", "confirmed", "in_progress", "completed", "cancelled"] as TabKey[]).map((t) => {
            const count = t === "all" ? orders.length : orders.filter((o) => o.status === t).length;
            return (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {t.replace("_", " ")} {count > 0 && <span className="ml-1 text-[10px]">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      {displayed.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <i className="fas fa-inbox text-5xl text-slate-200 mb-4" />
          <h3 className="text-lg font-black text-slate-400">No orders found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Order ID", "Service", "Customer", "Seller", "Date", "Price", "District", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayed.map((o) => (
                  <>
                    <tr key={o.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-slate-600">{o.id}</td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-900 max-w-[180px] truncate">{o.serviceTitle}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{o.customerName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{o.vendorName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{o.date}</td>
                      <td className="px-4 py-3 text-sm font-black text-slate-900 whitespace-nowrap">{formatPrice(o.price)}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{o.district}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full ${STATUS_PILL[o.status]}`}>
                          {o.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <i className={`fas fa-chevron-${expandedId === o.id ? "up" : "down"} text-slate-400 text-xs`} />
                        </div>
                      </td>
                    </tr>
                    {expandedId === o.id && (
                      <tr key={`${o.id}-expanded`} className="bg-slate-50/80">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="grid sm:grid-cols-3 gap-3 mb-4">
                            {[
                              { label: "Customer Phone", val: o.customerPhone },
                              { label: "Vendor Phone", val: o.vendorPhone },
                              { label: "Time", val: o.time || "—" },
                              { label: "Category", val: o.category },
                              { label: "Platform Fee", val: formatPrice(Math.round(o.price * 0.1)) },
                              { label: "Seller Net", val: formatPrice(Math.round(o.price * 0.9)) },
                            ].map((r) => (
                              <div key={r.label} className="bg-white rounded-xl p-3 border border-slate-100">
                                <div className="text-[10px] text-slate-400 font-bold uppercase">{r.label}</div>
                                <div className="text-sm font-bold text-slate-900 mt-0.5">{r.val}</div>
                              </div>
                            ))}
                          </div>
                          {o.notes && (
                            <div className="mb-3 p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800">
                              <i className="fas fa-note-sticky mr-1.5" />{o.notes}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {o.status === "pending" && (
                              <>
                                <button onClick={() => changeStatus(o.id, "confirmed")} className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-600 transition">
                                  <i className="fas fa-check" /> Accept
                                </button>
                                <button onClick={() => changeStatus(o.id, "cancelled")} className="flex items-center gap-1.5 bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-red-100 transition">
                                  <i className="fas fa-xmark" /> Cancel
                                </button>
                              </>
                            )}
                            {o.status === "confirmed" && (
                              <button onClick={() => changeStatus(o.id, "in_progress")} className="flex items-center gap-1.5 bg-violet-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-violet-600 transition">
                                <i className="fas fa-hammer" /> Start Work
                              </button>
                            )}
                            {o.status === "in_progress" && (
                              <button onClick={() => changeStatus(o.id, "completed")} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition">
                                <i className="fas fa-flag-checkered" /> Complete
                              </button>
                            )}
                            <a href={`https://wa.me/${o.vendorPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#25D366]/20 transition">
                              <i className="fab fa-whatsapp" /> Seller
                            </a>
                            <a href={`https://wa.me/${o.customerPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#25D366]/20 transition">
                              <i className="fab fa-whatsapp" /> Buyer
                            </a>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
