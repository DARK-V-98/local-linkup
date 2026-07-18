import { useState, useEffect, useMemo } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { type StoredBooking } from "@/lib/store";
import { useAllBookings } from "@/hooks/useAllBookings";
import { formatPrice } from "@/lib/format";
import { usePageTitle } from "@/lib/usePageTitle";
import { toast } from "sonner";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

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

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildMonthlyRevenue(bookings: StoredBooking[]) {
  const map: Record<string, { gmv: number; fee: number; orders: number }> = {};
  bookings.filter((b) => b.status === "completed").forEach((b) => {
    const d = new Date(b.createdAt);
    const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    if (!map[key]) map[key] = { gmv: 0, fee: 0, orders: 0 };
    map[key].gmv += b.price;
    map[key].fee += Math.round(b.price * 0.1);
    map[key].orders += 1;
  });
  return Object.entries(map)
    .sort(([a], [b]) => new Date("1 " + a).getTime() - new Date("1 " + b).getTime())
    .map(([month, v]) => ({ month: month.split(" ")[0], ...v }));
}

function buildCategoryRevenue(bookings: StoredBooking[]) {
  const map: Record<string, number> = {};
  bookings.filter((b) => b.status === "completed").forEach((b) => {
    map[b.category] = (map[b.category] ?? 0) + b.price;
  });
  const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, gmv]) => ({ name, gmv, share: Math.round((gmv / total) * 100) }));
}

const BAR_COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

export default function AdminPayments() {
  usePageTitle("Payments — Admin");
  const { bookings } = useAllBookings();
  const [period, setPeriod] = useState<"monthly" | "category">("monthly");


  const completed = useMemo(() => bookings.filter((b) => b.status === "completed"), [bookings]);
  const gmv = useMemo(() => completed.reduce((s, b) => s + b.price, 0), [completed]);
  const fee = useMemo(() => completed.reduce((s, b) => s + Math.round(b.price * 0.1), 0), [completed]);
  const avgOrder = completed.length ? Math.round(gmv / completed.length) : 0;

  const monthly = useMemo(() => buildMonthlyRevenue(bookings), [bookings]);
  const categoryRev = useMemo(() => buildCategoryRevenue(bookings), [bookings]);

  // Top earning sellers
  const sellerMap = useMemo(() => {
    const map: Record<string, { name: string; gmv: number; orders: number; fee: number }> = {};
    completed.forEach((b) => {
      if (!map[b.vendorName]) map[b.vendorName] = { name: b.vendorName, gmv: 0, orders: 0, fee: 0 };
      map[b.vendorName].gmv += b.price;
      map[b.vendorName].orders += 1;
      map[b.vendorName].fee += Math.round(b.price * 0.1);
    });
    return Object.values(map).sort((a, b) => b.gmv - a.gmv).slice(0, 8);
  }, [completed]);

  // Recent transactions
  const recent = useMemo(() => [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 15), [bookings]);

  return (
    <DashboardShell role="System Admin" sidebarItems={adminSidebarItems}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Payments & Revenue</h1>
          <p className="text-slate-500 text-sm">Platform-wide financial overview.</p>
        </div>
        <button onClick={() => toast.info("Export feature: generates full financial report CSV.")}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-slate-800 transition">
          <i className="fas fa-file-export" /> Export Report
        </button>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Gross Merchandise Value", val: formatPrice(gmv), icon: "fa-coins", highlight: true },
          { label: "Platform Revenue (10%)", val: formatPrice(fee), icon: "fa-money-bill-wave", color: "text-emerald-600 bg-emerald-50" },
          { label: "Completed Orders", val: completed.length, icon: "fa-flag-checkered", color: "text-blue-600 bg-blue-50" },
          { label: "Avg Order Value", val: formatPrice(avgOrder), icon: "fa-chart-bar", color: "text-violet-600 bg-violet-50" },
        ].map((s) => (
          <div key={s.label} className={`p-5 rounded-3xl border shadow-soft ${s.highlight ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200"}`}>
            <div className={`w-10 h-10 rounded-xl grid place-items-center mb-3 ${s.highlight ? "bg-white/10" : (s as { color?: string }).color?.split(" ")[1] ?? "bg-slate-100"}`}>
              <i className={`fas ${s.icon} text-sm ${s.highlight ? "text-white" : (s as { color?: string }).color?.split(" ")[0]}`} />
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider mb-1 text-slate-400">{s.label}</div>
            <div className={`text-xl font-black ${s.highlight ? "text-white" : "text-slate-900"}`}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Fee breakdown note */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 flex items-center gap-3 mb-8 text-sm">
        <i className="fas fa-circle-info text-blue-500" />
        <span className="text-blue-800">Platform earns a <strong>10% commission</strong> on every completed order. Sellers receive 90% as their net payout.</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-900">Revenue Breakdown</h3>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {(["monthly", "category"] as const).map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${period === p ? "bg-white text-slate-900 shadow-soft" : "text-slate-400"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          {monthly.length === 0 && categoryRev.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">
              No completed orders yet — revenue will appear here.
            </div>
          ) : period === "monthly" ? (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly}>
                  <defs>
                    <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: "1rem", border: "none" }} formatter={(v: number) => [formatPrice(v)]} />
                  <Area type="monotone" dataKey="fee" name="Platform Fee" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#feeGrad)" />
                  <Area type="monotone" dataKey="gmv" name="GMV" stroke="#10b981" strokeWidth={2} fill="none" strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryRev} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }} width={100} />
                  <Tooltip contentStyle={{ borderRadius: "1rem", border: "none" }} formatter={(v: number) => [formatPrice(v), "GMV"]} />
                  <Bar dataKey="gmv" radius={[0, 6, 6, 0]} barSize={18}>
                    {categoryRev.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top sellers */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6">
          <h3 className="font-black text-slate-900 mb-5">Top Earning Sellers</h3>
          {sellerMap.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No seller data yet.</p>
          ) : (
            <div className="space-y-3">
              {sellerMap.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 grid place-items-center text-[10px] font-black shrink-0">{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-brand grid place-items-center text-white font-black text-xs shrink-0">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">{s.name}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">{s.orders} orders · Fee: {formatPrice(s.fee)}</div>
                  </div>
                  <span className="text-sm font-black text-emerald-600 shrink-0">{formatPrice(s.gmv)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-black text-slate-900">Recent Transactions</h3>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No transactions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50">
                  {["ID", "Service", "Seller", "Buyer", "Amount", "Platform Fee", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recent.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono text-[11px] font-bold text-slate-500">{b.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-900 font-semibold max-w-[150px] truncate">{b.serviceTitle}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{b.vendorName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{b.customerName}</td>
                    <td className="px-4 py-3 text-sm font-black text-slate-900 whitespace-nowrap">{formatPrice(b.price)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600 whitespace-nowrap">
                      {b.status === "completed" ? formatPrice(Math.round(b.price * 0.1)) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        b.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                        b.status === "pending" ? "bg-amber-50 text-amber-600" :
                        b.status === "cancelled" ? "bg-red-50 text-red-500" :
                        "bg-blue-50 text-blue-600"
                      }`}>{b.status.replace("_", " ")}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(b.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
