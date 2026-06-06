import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
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

type ServiceStatus = "active" | "paused" | "flagged" | "removed";

interface CatalogService {
  id: string;
  title: string;
  category: string;
  categoryIcon: string;
  seller: string;
  district: string;
  price: number;
  priceUnit: string;
  status: ServiceStatus;
  rating: number;
  orders: number;
  views: number;
  flags: number;
  createdAt: string;
}

const SERVICES: CatalogService[] = [
  { id: "S001", title: "Full House Plumbing Maintenance", category: "Plumbing", categoryIcon: "fa-wrench", seller: "Tharindu P.", district: "Colombo", price: 3500, priceUnit: "per visit", status: "active", rating: 4.9, orders: 87, views: 2340, flags: 0, createdAt: "2023-06-12" },
  { id: "S002", title: "Modern Logo Design Package", category: "Graphic Design", categoryIcon: "fa-palette", seller: "Hashini W.", district: "Colombo", price: 8500, priceUnit: "per project", status: "active", rating: 5.0, orders: 42, views: 1890, flags: 0, createdAt: "2023-08-20" },
  { id: "S003", title: "Home Deep Cleaning Service", category: "Cleaning", categoryIcon: "fa-broom", seller: "Eco Cleaners", district: "Negombo", price: 6500, priceUnit: "per session", status: "flagged", rating: 3.2, orders: 4, views: 340, flags: 3, createdAt: "2024-02-14" },
  { id: "S004", title: "AC Installation & Service", category: "Electrical", categoryIcon: "fa-bolt", seller: "Sky Electricals", district: "Kandy", price: 4500, priceUnit: "per unit", status: "active", rating: 4.7, orders: 56, views: 2100, flags: 0, createdAt: "2023-11-01" },
  { id: "S005", title: "React & Next.js Website Development", category: "Technology", categoryIcon: "fa-laptop-code", seller: "Sumudu W.", district: "Colombo", price: 35000, priceUnit: "per project", status: "active", rating: 4.8, orders: 22, views: 3400, flags: 0, createdAt: "2024-01-15" },
  { id: "S006", title: "Cheap iPhone Screen Repair", category: "Technology", categoryIcon: "fa-mobile-screen", seller: "QuickFix Pro", district: "Gampaha", price: 2000, priceUnit: "per repair", status: "removed", rating: 2.1, orders: 0, views: 120, flags: 5, createdAt: "2024-10-01" },
  { id: "S007", title: "Wedding Photography Package", category: "Photography", categoryIcon: "fa-camera", seller: "Sumudu W.", district: "Colombo", price: 45000, priceUnit: "per event", status: "active", rating: 5.0, orders: 18, views: 4200, flags: 0, createdAt: "2023-07-05" },
  { id: "S008", title: "A/L Combined Maths Tuition", category: "Tuition", categoryIcon: "fa-book", seller: "Kasun J.", district: "Galle", price: 2500, priceUnit: "per hour", status: "paused", rating: 4.6, orders: 31, views: 980, flags: 0, createdAt: "2023-09-22" },
];

const STATUS_STYLE: Record<ServiceStatus, string> = {
  active: "bg-emerald-50 text-emerald-600 border-emerald-200",
  paused: "bg-slate-100 text-slate-500 border-slate-200",
  flagged: "bg-amber-50 text-amber-600 border-amber-200",
  removed: "bg-rose-50 text-rose-600 border-rose-200",
};

export default function AdminServices() {
  const [services, setServices] = useState<CatalogService[]>(SERVICES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"orders" | "rating" | "flags" | "views">("orders");

  const filtered = services
    .filter((s) => {
      const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.seller.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const counts = {
    all: services.length,
    active: services.filter((s) => s.status === "active").length,
    paused: services.filter((s) => s.status === "paused").length,
    flagged: services.filter((s) => s.status === "flagged").length,
    removed: services.filter((s) => s.status === "removed").length,
  };

  const updateStatus = (id: string, status: ServiceStatus) => {
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
    toast.success(`Service ${status}.`);
  };

  return (
    <DashboardShell role="System Admin" sidebarItems={adminSidebarItems}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Service Catalog</h1>
          <p className="text-slate-500 font-medium mt-1">Review, moderate and manage all platform listings.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2">
          <i className="fas fa-flag text-amber-500 text-sm" />
          <span className="text-sm font-bold text-amber-700">{counts.flagged} flagged</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {(["all", "active", "paused", "flagged", "removed"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`p-4 rounded-2xl border text-left transition ${statusFilter === s ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 hover:border-slate-300"}`}>
            <div className={`text-2xl font-black ${statusFilter === s ? "text-white" : "text-slate-900"}`}>{counts[s as keyof typeof counts]}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-1 text-slate-400 capitalize">{s}</div>
          </button>
        ))}
      </div>

      {/* Search + sort */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or seller..." className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900" />
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900">
          <option value="orders">Sort: Most Orders</option>
          <option value="views">Sort: Most Views</option>
          <option value="rating">Sort: Highest Rated</option>
          <option value="flags">Sort: Most Flagged</option>
        </select>
        <span className="text-sm text-slate-400 font-semibold self-center">{filtered.length} services</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Service", "Seller", "Category", "Price", "Status", "Stats", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider first:pl-6 last:pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((svc) => (
                <tr key={svc.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                        <i className={`fas ${svc.categoryIcon} text-sm`} />
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-sm line-clamp-1 max-w-[180px]">{svc.title}</div>
                        <div className="text-[11px] text-slate-400">{svc.district} · #{svc.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-700">{svc.seller}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{svc.category}</td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-900">Rs. {svc.price.toLocaleString()}<span className="text-[10px] text-slate-400 font-normal"> /{svc.priceUnit}</span></td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLE[svc.status]}`}>{svc.status}</span>
                    {svc.flags > 0 && <span className="ml-1 text-[10px] font-black text-rose-500"><i className="fas fa-flag" /> {svc.flags}</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-[11px] space-y-0.5">
                      <div className="text-slate-700 font-bold"><i className="fas fa-star text-amber-400 mr-1" />{svc.rating}</div>
                      <div className="text-slate-400">{svc.orders} orders · {svc.views} views</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Link to={`/service/${svc.id}`} className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white transition grid place-items-center" title="View">
                        <i className="fas fa-eye text-xs" />
                      </Link>
                      {svc.status !== "removed" && (
                        <>
                          <button onClick={() => updateStatus(svc.id, svc.status === "paused" ? "active" : "paused")}
                            className={`w-8 h-8 rounded-lg grid place-items-center transition text-xs ${svc.status === "paused" ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                            title={svc.status === "paused" ? "Activate" : "Pause"}>
                            <i className={`fas ${svc.status === "paused" ? "fa-play" : "fa-pause"}`} />
                          </button>
                          <button onClick={() => updateStatus(svc.id, "removed")}
                            className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition grid place-items-center text-xs" title="Remove">
                            <i className="fas fa-trash" />
                          </button>
                        </>
                      )}
                      {svc.status === "removed" && (
                        <button onClick={() => updateStatus(svc.id, "active")}
                          className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition grid place-items-center text-xs" title="Restore">
                          <i className="fas fa-rotate-left" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <i className="fas fa-layer-group text-3xl mb-3 block opacity-30" />
              <div className="font-bold">No services match your search</div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
