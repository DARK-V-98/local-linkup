import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { getMyServices, updateService, deleteService, StoredService } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";

const sellerSidebarItems = [
  { label: "Overview", to: "/dashboard/seller", icon: "fa-chart-line" },
  { label: "My Services", to: "/dashboard/seller/services", icon: "fa-briefcase" },
  { label: "Orders", to: "/dashboard/seller/orders", icon: "fa-cart-flatbed" },
  { label: "Earnings", to: "/dashboard/seller/earnings", icon: "fa-wallet" },
  { label: "Settings", to: "/dashboard/seller/settings", icon: "fa-user-gear" },
];

const STATUS_PILL: Record<string, string> = {
  active: "text-emerald-700 bg-emerald-100",
  paused: "text-amber-700 bg-amber-100",
  draft: "text-slate-500 bg-slate-100",
};

export default function MyServices() {
  const [services, setServices] = useState<StoredService[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "paused" | "draft">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editTarget, setEditTarget] = useState<StoredService | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const refresh = () => {
    setServices(getMyServices());
    setSelected(new Set());
  };

  useEffect(() => { refresh(); }, []);

  const toggle = (s: StoredService) => {
    const next = s.status === "active" ? "paused" : "active";
    updateService(s.id, { status: next });
    toast.success(`Service ${next === "active" ? "activated" : "paused"}.`);
    refresh();
  };

  const remove = (id: string) => {
    if (!confirm("Delete this service? This cannot be undone.")) return;
    deleteService(id);
    toast.success("Service deleted.");
    refresh();
  };

  const openEdit = (s: StoredService) => {
    setEditTarget(s);
    setEditTitle(s.title);
    setEditPrice(s.price.toString());
    setEditDesc(s.description);
  };

  const saveEdit = () => {
    if (!editTarget) return;
    const price = Number(editPrice);
    if (!editTitle.trim()) { toast.error("Title is required."); return; }
    if (isNaN(price) || price < 0) { toast.error("Enter a valid price."); return; }
    updateService(editTarget.id, { title: editTitle.trim(), price, description: editDesc });
    toast.success("Service updated.");
    setEditTarget(null);
    refresh();
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const bulkPause = () => {
    selected.forEach((id) => updateService(id, { status: "paused" }));
    toast.success(`${selected.size} service(s) paused.`);
    refresh();
  };

  const bulkActivate = () => {
    selected.forEach((id) => updateService(id, { status: "active" }));
    toast.success(`${selected.size} service(s) activated.`);
    refresh();
  };

  const bulkDelete = () => {
    if (!confirm(`Delete ${selected.size} service(s)?`)) return;
    selected.forEach((id) => deleteService(id));
    toast.success(`${selected.size} service(s) deleted.`);
    refresh();
  };

  const displayed = services.filter((s) => filter === "all" || s.status === filter);
  const totalViews = services.reduce((a, s) => a + s.views, 0);
  const totalOrders = services.reduce((a, s) => a + s.orders, 0);

  return (
    <DashboardShell role="Verified Seller" sidebarItems={sellerSidebarItems}>
      {/* Edit modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-glass">
            <h3 className="font-black text-lg mb-5">Edit Service</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Title</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Price (Rs.)</label>
                <input
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  type="number"
                  min={0}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold hover:bg-slate-50 transition">Cancel</button>
              <button onClick={saveEdit} className="flex-1 py-2.5 rounded-xl bg-gradient-brand text-primary-foreground text-sm font-bold shadow-glow hover:scale-[1.02] transition">Save</button>
            </div>
          </div>
        </div>
      )}

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

      {/* Filter tabs + bulk actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
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

        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">{selected.size} selected</span>
            <button onClick={bulkActivate} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition">Activate</button>
            <button onClick={bulkPause} className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 text-xs font-bold hover:bg-amber-100 transition">Pause</button>
            <button onClick={bulkDelete} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-500 text-xs font-bold hover:bg-red-100 transition">Delete</button>
          </div>
        )}
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
            <div
              key={s.id}
              className={`bg-white border rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 transition ${selected.has(s.id) ? "border-primary/40 bg-primary/[0.02]" : "border-slate-200 hover:border-primary/30"}`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selected.has(s.id)}
                onChange={() => toggleSelect(s.id)}
                className="accent-primary w-4 h-4 mt-1 sm:mt-0 shrink-0"
              />

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
                  onClick={() => openEdit(s)}
                  className="px-3 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition text-xs font-bold"
                  title="Edit"
                >
                  <i className="fas fa-pen text-xs" />
                </button>
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
