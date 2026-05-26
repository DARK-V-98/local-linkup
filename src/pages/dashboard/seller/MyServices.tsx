import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getMyServices, updateService, deleteService, StoredService } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { MOCK_LATEST_SERVICES } from "@/data/mock";
import { toast } from "sonner";

const sellerSidebarItems = [
  { label: "Overview", to: "/dashboard/seller", icon: "fa-chart-line" },
  { label: "My Services", to: "/dashboard/seller/services", icon: "fa-briefcase" },
  { label: "Orders", to: "/dashboard/seller/orders", icon: "fa-cart-flatbed" },
  { label: "Earnings", to: "/dashboard/seller/earnings", icon: "fa-wallet" },
  { label: "Settings", to: "/dashboard/seller/settings", icon: "fa-user-gear" },
];

const DEMO_SERVICES: StoredService[] = MOCK_LATEST_SERVICES.slice(0, 3).map((s) => ({
  id: s.id,
  title: s.title,
  category: s.category,
  categoryIcon: s.categoryIcon,
  description: s.description ?? "",
  price: s.price,
  priceUnit: s.priceUnit ?? "project",
  type: s.type,
  tags: s.tags ?? [],
  district: s.district,
  status: "active" as const,
  views: Math.floor(Math.random() * 800 + 100),
  orders: s.reviews,
  rating: s.rating,
  createdAt: s.postedAt.toISOString(),
}));

const STATUS_PILL: Record<string, string> = {
  active: "text-emerald-700 bg-emerald-100",
  paused: "text-amber-700 bg-amber-100",
  draft: "text-slate-500 bg-slate-100",
};

export default function MyServices() {
  const [services, setServices] = useState<StoredService[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "draft">("all");

  const refresh = () => {
    const stored = getMyServices();
    setServices([...stored, ...DEMO_SERVICES]);
  };

  useEffect(() => { refresh(); }, []);

  const toggle = (s: StoredService) => {
    if (s.id.startsWith("l") || s.id.startsWith("t")) {
      toast.info("Demo services can't be edited. Create your own to manage them.");
      return;
    }
    const next = s.status === "active" ? "paused" : "active";
    updateService(s.id, { status: next });
    toast.success(`Service ${next === "active" ? "activated" : "paused"}.`);
    refresh();
  };

  const remove = (id: string) => {
    if (id.startsWith("l") || id.startsWith("t")) {
      toast.info("Demo services can't be deleted.");
      return;
    }
    deleteService(id);
    toast.success("Service deleted.");
    refresh();
  };

  const displayed = services.filter((s) => filter === "all" || s.status === filter);

  const totalViews = services.reduce((a, s) => a + s.views, 0);
  const totalOrders = services.reduce((a, s) => a + s.orders, 0);
  const activeCount = services.filter((s) => s.status === "active").length;

  return (
    <DashboardShell role="Verified Seller" sidebarItems={sellerSidebarItems}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Services</h1>
          <p className="text-slate-500 text-sm">Manage your active listings and performance.</p>
        </div>
        <Link
          to="/dashboard/seller/new-service"
          className="inline-flex items-center gap-2 bg-gradient-brand text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-glow hover:scale-105 transition text-sm"
        >
          <i className="fas fa-plus" /> Post New Service
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Services", val: services.length, icon: "fa-briefcase", color: "text-blue-600 bg-blue-50" },
          { label: "Total Views", val: totalViews.toLocaleString(), icon: "fa-eye", color: "text-violet-600 bg-violet-50" },
          { label: "Total Orders", val: totalOrders, icon: "fa-cart-flatbed", color: "text-emerald-600 bg-emerald-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-3">
            <span className={`w-10 h-10 rounded-xl ${s.color} grid place-items-center shrink-0`}>
              <i className={`fas ${s.icon} text-sm`} />
            </span>
            <div>
              <div className="text-xl font-black text-slate-900">{s.val}</div>
              <div className="text-xs text-slate-400 font-bold">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-2xl w-fit">
        {(["all", "active", "paused", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition capitalize ${filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {f === "all" ? `All (${services.length})` : `${f} (${services.filter((s) => s.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Services list */}
      {displayed.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <i className="fas fa-briefcase text-5xl text-slate-200 mb-4" />
          <h3 className="text-lg font-black text-slate-400">No services yet</h3>
          <p className="text-sm text-slate-400 mt-1">Post your first service to start getting bookings.</p>
          <Link to="/dashboard/seller/new-service" className="mt-5 inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm">
            <i className="fas fa-plus" /> Create Service
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayed.map((s) => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:border-primary/30 transition">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 grid place-items-center shrink-0">
                  <i className={`${s.categoryIcon} text-2xl text-slate-400`} />
                </div>
                <div className="min-w-0">
                  <div className="font-black text-slate-900 truncate">{s.title}</div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${STATUS_PILL[s.status]}`}>
                      {s.status}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{s.category}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-400 font-semibold">{s.district}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-center shrink-0">
                <div>
                  <div className="text-sm font-black text-slate-900">{s.views}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Views</div>
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">{s.orders}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Orders</div>
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">{formatPrice(s.price)}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Price</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggle(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition ${s.status === "active" ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
                  title={s.status === "active" ? "Pause" : "Activate"}
                >
                  <i className={`fas ${s.status === "active" ? "fa-pause" : "fa-play"}`} />
                </button>
                <button
                  onClick={() => remove(s.id)}
                  className="px-3 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition text-xs font-bold"
                  title="Delete"
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
