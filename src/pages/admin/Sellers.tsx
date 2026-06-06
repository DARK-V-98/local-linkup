import { useState, useEffect, useMemo } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getBookings, getMyServices, StoredBooking, StoredService } from "@/lib/store";
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

interface SellerProfile {
  name: string;
  initial: string;
  phone: string;
  verified: boolean;
  district: string;
  services: number;
  orders: number;
  gmv: number;
  avgRating: number;
  status: "active" | "suspended" | "pending";
  joinedAt: string;
}

const BASE_SELLERS: SellerProfile[] = [
  { name: "Tharindu Perera", initial: "T", phone: "+94771234567", verified: true, district: "Colombo", services: 3, orders: 12, gmv: 420000, avgRating: 4.9, status: "active", joinedAt: "2023-06-10" },
  { name: "Nirmala Jayawardena", initial: "N", phone: "+94779876543", verified: true, district: "Kandy", services: 2, orders: 8, gmv: 168000, avgRating: 4.8, status: "active", joinedAt: "2023-08-20" },
  { name: "Kasun Jayasinghe", initial: "K", phone: "+94766543210", verified: true, district: "Galle", services: 1, orders: 5, gmv: 52500, avgRating: 4.7, status: "active", joinedAt: "2023-11-05" },
  { name: "Sumudu Fernando", initial: "S", phone: "+94788901234", verified: true, district: "Colombo", services: 4, orders: 24, gmv: 860000, avgRating: 4.9, status: "active", joinedAt: "2023-09-12" },
  { name: "Ravi Mendis", initial: "R", phone: "+94762345678", verified: false, district: "Gampaha", services: 1, orders: 3, gmv: 18500, avgRating: 4.3, status: "active", joinedAt: "2024-02-14" },
  { name: "Eco Cleaners Ltd", initial: "E", phone: "+94775566778", verified: false, district: "Negombo", services: 2, orders: 4, gmv: 42000, avgRating: 3.8, status: "suspended", joinedAt: "2024-02-14" },
  { name: "Pradeep Nishantha", initial: "P", phone: "+94777654321", verified: true, district: "Colombo", services: 1, orders: 9, gmv: 112500, avgRating: 4.6, status: "active", joinedAt: "2024-01-08" },
];

const STATUS_STYLE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-600",
  suspended: "bg-red-50 text-red-500",
  pending: "bg-amber-50 text-amber-600",
};

export default function AdminSellers() {
  usePageTitle("Sellers — Admin");
  const [sellers, setSellers] = useState<SellerProfile[]>(BASE_SELLERS);
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [services, setServices] = useState<StoredService[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);
  const [districtFilter, setDistrictFilter] = useState("All");

  useEffect(() => {
    setBookings(getBookings());
    setServices(getMyServices());
  }, []);

  // Build real-data sellers from bookings
  const enrichedSellers = useMemo(() => {
    const fromBookings: Record<string, SellerProfile> = {};
    bookings.filter((b) => b.status === "completed").forEach((b) => {
      if (!fromBookings[b.vendorName]) {
        fromBookings[b.vendorName] = {
          name: b.vendorName, initial: b.vendorInitial, phone: b.vendorPhone,
          verified: b.vendorVerified, district: b.district, services: 0,
          orders: 0, gmv: 0, avgRating: 4.5, status: "active",
          joinedAt: new Date(b.createdAt).toISOString().split("T")[0],
        };
      }
      fromBookings[b.vendorName].orders += 1;
      fromBookings[b.vendorName].gmv += b.price;
    });
    // Merge: prefer BASE_SELLERS but enrich with real data
    const merged = [...BASE_SELLERS];
    Object.values(fromBookings).forEach((r) => {
      const existing = merged.find((s) => s.name === r.name);
      if (!existing) merged.push(r);
      else {
        existing.orders = Math.max(existing.orders, r.orders);
        existing.gmv = Math.max(existing.gmv, r.gmv);
      }
    });
    // Add services count from real services
    services.forEach((svc) => {
      const match = merged.find((s) => s.verified);
      if (match) match.services = Math.max(match.services, services.length);
    });
    return merged;
  }, [bookings, services]);

  const allDistricts = useMemo(() => ["All", ...Array.from(new Set(enrichedSellers.map((s) => s.district)))], [enrichedSellers]);

  const displayed = useMemo(() => enrichedSellers.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (districtFilter !== "All" && s.district !== districtFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.phone.includes(q) || s.district.toLowerCase().includes(q);
    }
    return true;
  }), [enrichedSellers, statusFilter, districtFilter, search]);

  const toggleStatus = (name: string) => {
    setSellers((prev) => prev.map((s) => s.name === name ? {
      ...s, status: s.status === "active" ? "suspended" : "active"
    } : s));
    const seller = sellers.find((s) => s.name === name);
    toast.success(`${seller?.name} ${seller?.status === "active" ? "suspended" : "activated"}.`);
  };

  const verify = (name: string) => {
    setSellers((prev) => prev.map((s) => s.name === name ? { ...s, verified: true } : s));
    toast.success(`${name} verified successfully.`);
  };

  const stats = useMemo(() => ({
    total: enrichedSellers.length,
    active: enrichedSellers.filter((s) => s.status === "active").length,
    verified: enrichedSellers.filter((s) => s.verified).length,
    topGmv: enrichedSellers.reduce((s, x) => s + x.gmv, 0),
  }), [enrichedSellers]);

  const sellerBookings = useMemo(() =>
    selectedSeller ? bookings.filter((b) => b.vendorName === selectedSeller.name) : []
  , [selectedSeller, bookings]);

  return (
    <DashboardShell role="System Admin" sidebarItems={adminSidebarItems}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Sellers</h1>
          <p className="text-slate-500 text-sm">Manage all registered service providers.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Sellers", val: stats.total, icon: "fa-store", color: "text-blue-600 bg-blue-50" },
          { label: "Active", val: stats.active, icon: "fa-circle-check", color: "text-emerald-600 bg-emerald-50" },
          { label: "Verified", val: stats.verified, icon: "fa-shield-halved", color: "text-violet-600 bg-violet-50" },
          { label: "Total GMV", val: formatPrice(stats.topGmv), icon: "fa-coins", color: "text-amber-600 bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <span className={`w-9 h-9 rounded-xl ${s.color} grid place-items-center shrink-0`}>
              <i className={`fas ${s.icon} text-sm`} />
            </span>
            <div>
              <div className="text-base font-black text-slate-900">{s.val}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative sm:w-64">
          <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sellers…"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold focus:outline-none">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
        <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-semibold focus:outline-none">
          {allDistricts.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Seller grid */}
      <div className="space-y-3">
        {displayed.map((s) => (
          <div key={s.name} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary/30 transition">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-brand grid place-items-center text-white font-black text-lg shrink-0">
                {s.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-slate-900">{s.name}</span>
                  {s.verified && (
                    <span className="flex items-center gap-1 text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <i className="fas fa-shield-halved" /> Verified
                    </span>
                  )}
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_STYLE[s.status]}`}>{s.status}</span>
                </div>
                <div className="text-xs text-slate-400 font-semibold mt-0.5">
                  {s.district} · <i className="fas fa-phone text-[9px]" /> {s.phone}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-center sm:w-auto w-full">
              {[
                { label: "Services", val: s.services },
                { label: "Orders", val: s.orders },
                { label: "GMV", val: formatPrice(s.gmv) },
                { label: "Rating", val: `${s.avgRating} ★` },
              ].map((m) => (
                <div key={m.label}>
                  <div className="text-sm font-black text-slate-900">{m.val}</div>
                  <div className="text-[10px] text-slate-400 font-bold">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 shrink-0">
              <button onClick={() => setSelectedSeller(s === selectedSeller ? null : s)}
                className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition">
                <i className="fas fa-eye" /> Details
              </button>
              {!s.verified && (
                <button onClick={() => verify(s.name)}
                  className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 transition">
                  <i className="fas fa-shield-halved" /> Verify
                </button>
              )}
              <button onClick={() => toggleStatus(s.name)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${s.status === "active" ? "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"}`}>
                <i className={`fas ${s.status === "active" ? "fa-ban" : "fa-circle-check"}`} />
                {s.status === "active" ? "Suspend" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Seller detail panel */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedSeller(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-7 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-brand grid place-items-center text-white font-black text-2xl">
                  {selectedSeller.initial}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{selectedSeller.name}</h2>
                  <p className="text-sm text-slate-400">{selectedSeller.district} · Joined {new Date(selectedSeller.joinedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSeller(null)} className="w-8 h-8 rounded-full hover:bg-slate-100 grid place-items-center">
                <i className="fas fa-xmark" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Services", val: selectedSeller.services, color: "bg-blue-50 text-blue-600" },
                { label: "Orders", val: selectedSeller.orders, color: "bg-emerald-50 text-emerald-600" },
                { label: "GMV", val: formatPrice(selectedSeller.gmv), color: "bg-violet-50 text-violet-600" },
                { label: "Rating", val: `${selectedSeller.avgRating} ★`, color: "bg-amber-50 text-amber-600" },
              ].map((m) => (
                <div key={m.label} className={`${m.color} rounded-2xl p-3 text-center`}>
                  <div className="text-lg font-black">{m.val}</div>
                  <div className="text-[10px] font-bold uppercase">{m.label}</div>
                </div>
              ))}
            </div>

            <h4 className="font-black text-slate-900 mb-3">Recent Orders</h4>
            {sellerBookings.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No orders found for this seller.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {sellerBookings.slice(0, 10).map((b) => (
                  <div key={b.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{b.serviceTitle}</div>
                      <div className="text-xs text-slate-400">{b.customerName} · {b.date}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-slate-900">{formatPrice(b.price)}</div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        b.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                        b.status === "pending" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                      }`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {!selectedSeller.verified && (
                <button onClick={() => { verify(selectedSeller.name); setSelectedSeller(null); }}
                  className="flex-1 bg-emerald-500 text-white py-3 rounded-2xl font-bold text-sm hover:bg-emerald-600 transition">
                  <i className="fas fa-shield-halved mr-2" /> Verify Seller
                </button>
              )}
              <button onClick={() => { toggleStatus(selectedSeller.name); setSelectedSeller(null); }}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm transition ${selectedSeller.status === "active" ? "bg-red-500 text-white hover:bg-red-600" : "bg-emerald-500 text-white hover:bg-emerald-600"}`}>
                {selectedSeller.status === "active" ? "Suspend Seller" : "Activate Seller"}
              </button>
              <button onClick={() => setSelectedSeller(null)} className="px-5 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
