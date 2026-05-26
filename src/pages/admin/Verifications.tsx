import { useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { toast } from "sonner";

const adminSidebarItems = [
  { label: "Overview", to: "/admin", icon: "fa-chart-pie" },
  { label: "Verifications", to: "/admin/verifications", icon: "fa-user-check" },
  { label: "User Management", to: "/admin/users", icon: "fa-users" },
  { label: "Service Catalog", to: "/admin/services", icon: "fa-layer-group" },
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

const INITIAL_APPS: Application[] = [
  { id: "V001", name: "Tharindu Perera", type: "Individual", category: "Plumbing", city: "Colombo", submittedAt: "2 mins ago", idType: "NIC", nic: "199512345678", status: "pending", docs: ["ID Front", "ID Back", "Selfie"], notes: "" },
  { id: "V002", name: "Lanka Homes (Pvt) Ltd", type: "Business", category: "Home Services", city: "Kandy", submittedAt: "15 mins ago", idType: "Business Reg.", nic: "PV12345", status: "pending", docs: ["BRN Certificate", "Owner NIC", "Tax Certificate"], notes: "" },
  { id: "V003", name: "Kasun Jayasuriya", type: "Individual", category: "Electrical", city: "Galle", submittedAt: "1 hour ago", idType: "Passport", nic: "N1234567", status: "pending", docs: ["Passport", "Selfie"], notes: "" },
  { id: "V004", name: "Eco Cleaners", type: "Business", category: "Cleaning", city: "Negombo", submittedAt: "3 hours ago", idType: "Business Reg.", nic: "PV98765", status: "pending", docs: ["BRN Certificate", "Owner NIC"], notes: "" },
  { id: "V005", name: "Sumudu Silva", type: "Individual", category: "Photography", city: "Colombo", submittedAt: "5 hours ago", idType: "NIC", nic: "200112345678", status: "pending", docs: ["ID Front", "ID Back", "Selfie"], notes: "" },
  { id: "V006", name: "Malith Fernando", type: "Individual", category: "Technology", city: "Colombo", submittedAt: "Yesterday", idType: "NIC", nic: "199888761234", status: "approved", docs: ["ID Front", "ID Back", "Selfie"], notes: "Documents verified. Good quality photos." },
  { id: "V007", name: "Royal Electricals", type: "Business", category: "Electrical", city: "Matara", submittedAt: "Yesterday", idType: "Business Reg.", nic: "PV55321", status: "rejected", docs: ["BRN Certificate", "Owner NIC"], notes: "BRN certificate expired. Please resubmit with updated documents." },
];

const STATUS_STYLE: Record<Status, string> = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  approved: "bg-emerald-50 text-emerald-600 border-emerald-200",
  rejected: "bg-rose-50 text-rose-600 border-rose-200",
};

export default function Verifications() {
  const [apps, setApps] = useState<Application[]>(INITIAL_APPS);
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

  const updateStatus = (id: string, status: Status) => {
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status, notes: noteInput || a.notes } : a));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status, notes: noteInput || prev.notes } : null);
    toast.success(status === "approved" ? "Seller approved and notified." : "Application rejected. Seller notified.");
    setNoteInput("");
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
