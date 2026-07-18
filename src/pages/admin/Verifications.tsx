import { useState, useMemo } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { toast } from "sonner";
import { useAllUsers } from "@/hooks/useAllUsers";
import { setUserVerified, setUserStatus, type UserProfile } from "@/lib/firestore/users";

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

type Status = "pending" | "approved" | "rejected";

interface Application {
  id: string;
  name: string;
  type: "Individual" | "Business";
  category: string;
  city: string;
  submittedAt: string;
  idType: string;
  nic: string;
  status: Status;
  docs: string[];
  notes: string;
}

/**
 * Sellers become verification applications: unverified sellers are pending,
 * verified ones approved, suspended ones rejected. There is no separate
 * application record — verification is a flag on the seller's profile.
 */
function toApplication(u: UserProfile): Application {
  const status: Status =
    u.status === "suspended" ? "rejected" : u.verified ? "approved" : "pending";
  return {
    id: u.id,
    name: u.businessName || u.name,
    type: u.sellerType === "business" ? "Business" : "Individual",
    category: u.sellerCategory ?? "—",
    city: u.district ?? "—",
    submittedAt: u.joinedAt ?? "",
    idType: u.sellerType === "business" ? "Business Reg." : "NIC",
    nic: u.phone ?? "—",
    status,
    docs: [],
    notes: "",
  };
}


const STATUS_STYLE: Record<Status, string> = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  approved: "bg-emerald-50 text-emerald-600 border-emerald-200",
  rejected: "bg-rose-50 text-rose-600 border-rose-200",
};

export default function Verifications() {
  const { users, loading } = useAllUsers();
  const apps = useMemo(
    () => users.filter((u) => u.role === "seller").map(toApplication),
    [users]
  );
  const [filter, setFilter] = useState<Status | "all">("pending");
  const [selected, setSelected] = useState<Application | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const counts = {
    all: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  const updateStatus = async (id: string, status: Status) => {
    try {
      if (status === "approved") {
        await setUserVerified(id, true);
        await setUserStatus(id, "active");
      } else {
        await setUserVerified(id, false);
        await setUserStatus(id, "suspended");
      }
      if (selected?.id === id) {
        setSelected({ ...selected, status, notes: noteInput || selected.notes });
      }
      toast.success(status === "approved" ? "Seller approved." : "Application rejected.");
      setNoteInput("");
    } catch {
      toast.error("Could not update this application.");
    }
  };

  return (
    <DashboardShell role="System Admin" sidebarItems={adminSidebarItems}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Seller Verifications</h1>
          <p className="text-slate-500 font-medium mt-1">Review and approve seller applications.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2">
          <i className="fas fa-clock text-amber-500" />
          <span className="text-sm font-bold text-amber-700">{counts.pending} pending review</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {(["all", "pending", "approved", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`p-4 rounded-2xl border text-left transition ${filter === s ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 hover:border-slate-300"}`}
          >
            <div className={`text-2xl font-black ${filter === s ? "text-white" : "text-slate-900"}`}>{counts[s]}</div>
            <div className={`text-xs font-bold uppercase tracking-wider mt-1 ${filter === s ? "text-slate-400" : "text-slate-400"}`}>{s}</div>
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1 min-w-0 space-y-3">
          {filtered.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
              <i className="fas fa-check-double text-3xl mb-3 block" />
              <div className="font-bold">No {filter} applications</div>
            </div>
          )}
          {filtered.map((app) => (
            <div
              key={app.id}
              onClick={() => { setSelected(app); setNoteInput(app.notes); }}
              className={`bg-white rounded-2xl border cursor-pointer transition hover:border-slate-300 hover:shadow-sm p-5 flex items-center gap-4 ${selected?.id === app.id ? "border-slate-900 shadow-soft" : "border-slate-200"}`}
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 grid place-items-center font-black text-slate-600 shrink-0 text-lg">
                {app.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-slate-900">{app.name}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${app.type === "Business" ? "bg-violet-50 text-violet-600 border-violet-200" : "bg-blue-50 text-blue-600 border-blue-200"}`}>
                    {app.type}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-semibold mt-0.5">{app.category} · {app.city} · {app.submittedAt}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${STATUS_STYLE[app.status]}`}>
                  {app.status}
                </span>
                {app.status === "pending" && (
                  <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => updateStatus(app.id, "approved")} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition grid place-items-center" title="Approve">
                      <i className="fas fa-check text-xs" />
                    </button>
                    <button onClick={() => updateStatus(app.id, "rejected")} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition grid place-items-center" title="Reject">
                      <i className="fas fa-xmark text-xs" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-80 shrink-0 hidden xl:block">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 sticky top-28">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="font-black text-slate-900 text-lg leading-tight">{selected.name}</div>
                  <div className="text-xs text-slate-400 font-semibold mt-0.5">Application #{selected.id}</div>
                </div>
                <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-full bg-slate-100 grid place-items-center hover:bg-slate-200 transition">
                  <i className="fas fa-xmark text-xs text-slate-500" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { label: "Type", val: selected.type },
                  { label: "Category", val: selected.category },
                  { label: "City", val: selected.city },
                  { label: "ID Type", val: selected.idType },
                  { label: "ID / Reg. No.", val: selected.nic },
                  { label: "Submitted", val: selected.submittedAt },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-slate-400 font-semibold">{row.label}</span>
                    <span className="font-bold text-slate-900">{row.val}</span>
                  </div>
                ))}
              </div>

              <div className="mb-5">
                <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Documents Submitted</div>
                <div className="space-y-2">
                  {selected.docs.map((doc) => (
                    <div key={doc} className="flex items-center gap-2 text-sm">
                      <i className="fas fa-file-circle-check text-emerald-500" />
                      <span className="font-semibold text-slate-700">{doc}</span>
                      <button className="ml-auto text-xs font-bold text-primary hover:underline">View</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Admin Notes</label>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add notes for this decision..."
                  rows={3}
                  className="mt-2 w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
              </div>

              {selected.status === "pending" ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateStatus(selected.id, "approved")}
                    className="py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition flex items-center justify-center gap-1.5"
                  >
                    <i className="fas fa-check" /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, "rejected")}
                    className="py-2.5 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 transition flex items-center justify-center gap-1.5"
                  >
                    <i className="fas fa-xmark" /> Reject
                  </button>
                </div>
              ) : (
                <div className={`text-center py-3 rounded-xl text-sm font-bold border ${STATUS_STYLE[selected.status]}`}>
                  <i className={`fas ${selected.status === "approved" ? "fa-circle-check" : "fa-circle-xmark"} mr-1.5`} />
                  {selected.status === "approved" ? "Application Approved" : "Application Rejected"}
                </div>
              )}

              {selected.notes && (
                <div className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2">
                  <span className="font-bold">Note: </span>{selected.notes}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
