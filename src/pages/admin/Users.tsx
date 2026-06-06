import { useState } from "react";
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

type Role = "buyer" | "seller" | "admin";
type UserStatus = "active" | "suspended" | "pending";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  district: string;
  status: UserStatus;
  verified: boolean;
  joinedAt: string;
  orders: number;
  spent?: number;
  earned?: number;
}

const USERS: AdminUser[] = [
  { id: "U001", name: "Saman Perera", email: "buyer@demo.com", phone: "+94771234567", role: "buyer", district: "Colombo", status: "active", verified: true, joinedAt: "2024-01-15", orders: 12, spent: 68500 },
  { id: "U002", name: "Tharindu P.", email: "seller@demo.com", phone: "+94779876543", role: "seller", district: "Colombo", status: "active", verified: true, joinedAt: "2023-06-10", orders: 87, earned: 142500 },
  { id: "U003", name: "Kamani Silva", email: "k.silva@gmail.com", phone: "+94772233445", role: "buyer", district: "Kandy", status: "active", verified: false, joinedAt: "2024-03-20", orders: 3, spent: 12000 },
  { id: "U004", name: "Kasun Jayasuriya", email: "kasun.j@gmail.com", phone: "+94773344556", role: "seller", district: "Galle", status: "pending", verified: false, joinedAt: "2024-10-18", orders: 0, earned: 0 },
  { id: "U005", name: "Nimal Dissanayake", email: "nimal.d@gmail.com", phone: "+94774455667", role: "buyer", district: "Colombo", status: "active", verified: true, joinedAt: "2023-11-05", orders: 25, spent: 185000 },
  { id: "U006", name: "Eco Cleaners", email: "eco@cleaners.lk", phone: "+94775566778", role: "seller", district: "Negombo", status: "suspended", verified: false, joinedAt: "2024-02-14", orders: 4, earned: 18000 },
  { id: "U007", name: "Pradeep Fernando", email: "pradeep.f@gmail.com", phone: "+94776677889", role: "buyer", district: "Gampaha", status: "active", verified: false, joinedAt: "2024-07-30", orders: 1, spent: 5500 },
  { id: "U008", name: "Sumudu Wijeratne", email: "sumudu.w@gmail.com", phone: "+94777788990", role: "seller", district: "Colombo", status: "active", verified: true, joinedAt: "2023-09-12", orders: 56, earned: 324000 },
  { id: "U009", name: "Admin User", email: "admin@demo.com", phone: "+94700000000", role: "admin", district: "Colombo", status: "active", verified: true, joinedAt: "2023-01-01", orders: 0 },
];

const ROLE_STYLE: Record<Role, string> = {
  buyer: "bg-blue-50 text-blue-600 border-blue-200",
  seller: "bg-violet-50 text-violet-600 border-violet-200",
  admin: "bg-red-50 text-red-600 border-red-200",
};

const STATUS_STYLE: Record<UserStatus, string> = {
  active: "bg-emerald-50 text-emerald-600",
  suspended: "bg-rose-50 text-rose-600",
  pending: "bg-amber-50 text-amber-600",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const toggleSuspend = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id
      ? { ...u, status: u.status === "suspended" ? "active" : "suspended" }
      : u
    ));
    const u = users.find((u) => u.id === id);
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status: prev.status === "suspended" ? "active" : "suspended" } : null);
    toast.success(u?.status === "suspended" ? "User reactivated." : "User suspended.");
  };

  const counts = {
    all: users.length,
    buyer: users.filter((u) => u.role === "buyer").length,
    seller: users.filter((u) => u.role === "seller").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  return (
    <DashboardShell role="System Admin" sidebarItems={adminSidebarItems}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">User Management</h1>
          <p className="text-slate-500 font-medium mt-1">View, manage and moderate all platform users.</p>
        </div>
        <div className="flex gap-2">
          {(["all", "buyer", "seller", "admin"] as const).map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition ${roleFilter === r ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-400"}`}>
              {r} <span className="opacity-60">({counts[r as keyof typeof counts] ?? filtered.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search + status filter */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "active", "pending", "suspended"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition ${statusFilter === s ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-500 hover:border-slate-400"}`}>
              {s}
            </button>
          ))}
        </div>
        <span className="text-sm text-slate-400 font-semibold self-center">{filtered.length} users</span>
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 min-w-0 bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["User", "Role", "District", "Status", "Activity", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider first:pl-6 last:pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => setSelected(user)}
                  className={`hover:bg-slate-50 cursor-pointer transition ${selected?.id === user.id ? "bg-slate-50" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 grid place-items-center font-black text-slate-600 text-sm shrink-0">
                        {user.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1">
                          {user.name}
                          {user.verified && <i className="fas fa-circle-check text-emerald-500 text-[10px]" />}
                        </div>
                        <div className="text-[11px] text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border capitalize ${ROLE_STYLE[user.role]}`}>{user.role}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600 font-semibold">{user.district}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[user.status]}`}>{user.status}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {user.role === "buyer" ? `${user.orders} bookings` : user.role === "seller" ? `${user.orders} orders` : "Admin"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleSuspend(user.id)}
                        className={`w-8 h-8 rounded-lg grid place-items-center transition text-xs ${user.status === "suspended" ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white" : "bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white"}`}
                        title={user.status === "suspended" ? "Reactivate" : "Suspend"}
                      >
                        <i className={`fas ${user.status === "suspended" ? "fa-lock-open" : "fa-ban"}`} />
                      </button>
                      <button
                        onClick={() => toast.info(`Viewing ${user.name}'s profile.`)}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white transition grid place-items-center text-xs"
                      >
                        <i className="fas fa-eye" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <i className="fas fa-users text-3xl mb-3 block opacity-30" />
              <div className="font-bold">No users match your search</div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-72 shrink-0 hidden xl:block">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-6 sticky top-28">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 grid place-items-center font-black text-slate-600 text-xl">
                  {selected.name[0]}
                </div>
                <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-full bg-slate-100 grid place-items-center hover:bg-slate-200 transition">
                  <i className="fas fa-xmark text-xs text-slate-500" />
                </button>
              </div>
              <div className="mb-1 flex items-center gap-2">
                <div className="font-black text-slate-900">{selected.name}</div>
                {selected.verified && <i className="fas fa-circle-check text-emerald-500 text-sm" />}
              </div>
              <div className="text-xs text-slate-400 mb-4">{selected.email}</div>

              <div className="space-y-2 text-sm mb-5">
                {[
                  { label: "Role", val: selected.role },
                  { label: "Phone", val: selected.phone },
                  { label: "District", val: selected.district },
                  { label: "Status", val: selected.status },
                  { label: "Joined", val: selected.joinedAt },
                  { label: selected.role === "seller" ? "Total Orders" : "Bookings", val: selected.orders },
                  ...(selected.role === "buyer" ? [{ label: "Total Spent", val: `Rs. ${(selected.spent ?? 0).toLocaleString()}` }] : []),
                  ...(selected.role === "seller" ? [{ label: "Total Earned", val: `Rs. ${(selected.earned ?? 0).toLocaleString()}` }] : []),
                ].map((r) => (
                  <div key={r.label} className="flex justify-between border-b border-slate-50 pb-1.5 last:border-0">
                    <span className="text-slate-400 font-semibold">{r.label}</span>
                    <span className="font-bold text-slate-900 capitalize">{r.val}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => toggleSuspend(selected.id)}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition ${selected.status === "suspended" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-rose-600 text-white hover:bg-rose-700"}`}
                >
                  <i className={`fas ${selected.status === "suspended" ? "fa-lock-open" : "fa-ban"} mr-1.5`} />
                  {selected.status === "suspended" ? "Reactivate Account" : "Suspend Account"}
                </button>
                <button
                  onClick={() => toast.info("Email sent to " + selected.email)}
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  <i className="fas fa-envelope mr-1.5" /> Send Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
