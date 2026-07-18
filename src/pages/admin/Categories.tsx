import { useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { toast } from "sonner";
import { usePageTitle } from "@/lib/usePageTitle";
import { useCategories } from "@/hooks/useCategories";
import type { AdminCategory } from "@/lib/adminCategories";

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

const COMMON_ICONS = [
  "fa-laptop-code","fa-house","fa-graduation-cap","fa-palette","fa-screwdriver-wrench",
  "fa-truck","fa-seedling","fa-car","fa-book","fa-leaf","fa-camera","fa-spa",
  "fa-cake-candles","fa-scale-balanced","fa-bullhorn","fa-heart-pulse","fa-music",
  "fa-dumbbell","fa-paw","fa-baby","fa-shirt","fa-utensils","fa-plane","fa-wifi",
  "fa-hammer","fa-wrench","fa-paint-roller","fa-plug","fa-droplet","fa-fire",
];

type CategoryForm = Pick<AdminCategory, "name" | "icon" | "description" | "active">;

const BLANK: CategoryForm = { name: "", icon: "fa-tag", description: "", active: true };

export default function AdminCategories() {
  usePageTitle("Categories — Admin");
  const { categories: cats, loading, error, add, update, remove } = useCategories({
    includeInactive: true,
    withCounts: true,
  });
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState<CategoryForm>(BLANK);
  const [iconSearch, setIconSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const name = form.name.trim();
    if (!name) { toast.error("Category name is required."); return; }
    if (!form.icon.trim()) { toast.error("Please select an icon."); return; }

    const clash = cats.find(
      (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== editing?.id
    );
    if (clash) { toast.error(`"${clash.name}" already exists.`); return; }

    setSaving(true);
    try {
      if (editing) {
        await update(editing.id, { ...form, name });
        toast.success("Category updated.");
      } else {
        await add({ ...form, name });
        toast.success(`"${name}" is now available to sellers.`);
      }
      setShowForm(false);
      setEditing(null);
      setForm(BLANK);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the category.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (cat: AdminCategory) => {
    try {
      await update(cat.id, { active: !cat.active });
      toast.success(`"${cat.name}" ${cat.active ? "hidden from sellers" : "activated"}.`);
    } catch {
      toast.error("Could not update the category.");
    }
  };

  const del = async (cat: AdminCategory) => {
    if (cat.serviceCount) {
      toast.error(`"${cat.name}" has ${cat.serviceCount} live service(s). Deactivate it instead.`);
      return;
    }
    try {
      await remove(cat.id);
      toast.success(`"${cat.name}" deleted.`);
    } catch {
      toast.error("Could not delete the category.");
    }
  };

  const openEdit = (cat: AdminCategory) => {
    setEditing(cat);
    setForm({ name: cat.name, icon: cat.icon, description: cat.description, active: cat.active });
    setShowForm(true);
  };

  const filtered = cats.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));
  const active = cats.filter((c) => c.active).length;
  const filteredIcons = COMMON_ICONS.filter((i) => !iconSearch || i.includes(iconSearch));

  return (
    <DashboardShell role="System Admin" sidebarItems={adminSidebarItems}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Categories</h1>
          <p className="text-slate-500 text-sm">{active} active · {cats.length} total</p>
        </div>
        <button
          onClick={() => { setEditing(null); setForm(BLANK); setShowForm(true); }}
          className="flex items-center gap-2 bg-gradient-brand text-primary-foreground px-5 py-2.5 rounded-2xl font-bold text-sm shadow-glow hover:scale-105 transition"
        >
          <i className="fas fa-plus" /> Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Categories", val: cats.length, icon: "fa-tags", color: "text-blue-600 bg-blue-50" },
          { label: "Active", val: active, icon: "fa-circle-check", color: "text-emerald-600 bg-emerald-50" },
          { label: "Live Services", val: cats.reduce((s, c) => s + (c.serviceCount ?? 0), 0).toLocaleString(), icon: "fa-briefcase", color: "text-violet-600 bg-violet-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
            <span className={`w-9 h-9 rounded-xl ${s.color} grid place-items-center shrink-0`}>
              <i className={`fas ${s.icon} text-sm`} />
            </span>
            <div>
              <div className="text-lg font-black text-slate-900">{s.val}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories…"
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          <i className="fas fa-triangle-exclamation mr-2" />{error}
        </div>
      )}

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <i className="fas fa-tags text-3xl text-slate-300" />
          <p className="mt-3 font-bold text-slate-500">
            {search ? `No categories match "${search}".` : "No categories yet."}
          </p>
          <p className="text-sm text-slate-400">Add one so sellers can register their business under it.</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => (
          <div key={cat.id} className={`bg-white border rounded-2xl p-5 flex items-start gap-4 transition ${cat.active ? "border-slate-200" : "border-dashed border-slate-300 opacity-60"}`}>
            <span className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
              <i className={`fas ${cat.icon} text-xl`} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 truncate">{cat.name}</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${cat.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                  {cat.active ? "Active" : "Off"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-tight truncate">{cat.description}</p>
              <div className="text-xs font-bold text-slate-500 mt-1.5">
                <i className="fas fa-briefcase text-primary mr-1" />
                {cat.serviceCount ?? 0} live {cat.serviceCount === 1 ? "service" : "services"}
              </div>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button onClick={() => openEdit(cat)} title="Edit" className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-primary hover:text-white text-slate-500 grid place-items-center transition">
                <i className="fas fa-pen text-[10px]" />
              </button>
              <button onClick={() => toggleActive(cat)} title={cat.active ? "Hide from sellers" : "Activate"} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-500 grid place-items-center transition">
                <i className={`fas ${cat.active ? "fa-eye-slash" : "fa-eye"} text-[10px]`} />
              </button>
              <button onClick={() => del(cat)} title="Delete" className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-500 hover:text-white text-slate-500 grid place-items-center transition">
                <i className="fas fa-trash text-[10px]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900">{editing ? "Edit Category" : "New Category"}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 grid place-items-center">
                <i className="fas fa-xmark" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Photography"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description of the category"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Icon</label>
                <input value={iconSearch} onChange={(e) => setIconSearch(e.target.value)} placeholder="Filter icons…"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                  {filteredIcons.map((ic) => (
                    <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })}
                      className={`w-9 h-9 rounded-xl grid place-items-center transition ${form.icon === ic ? "bg-primary text-white shadow-glow" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                      <i className={`fas ${ic} text-sm`} />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-1">Selected: <code className="bg-slate-100 px-1 rounded">{form.icon}</code></p>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-primary" />
                  <span className="text-sm font-bold text-slate-700">Active</span>
                </label>
                <p className="text-xs text-slate-400 mt-1">
                  Active categories appear on the home page and in the seller registration and
                  service forms. Service counts are read live from the catalog.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-7">
              <button onClick={save} disabled={saving} className="flex-1 bg-gradient-brand text-primary-foreground py-3 rounded-2xl font-bold text-sm shadow-glow hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100">
                {saving && <i className="fas fa-spinner fa-spin mr-2" />}
                {editing ? "Save Changes" : "Add Category"}
              </button>
              <button onClick={() => setShowForm(false)} className="px-5 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
