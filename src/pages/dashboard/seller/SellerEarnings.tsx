import DashboardShell from "@/components/dashboard/DashboardShell";
import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { getBookings, StoredBooking } from "@/lib/store";

const sellerSidebarItems = [
  { label: "Overview", to: "/dashboard/seller", icon: "fa-chart-line" },
  { label: "My Services", to: "/dashboard/seller/services", icon: "fa-briefcase" },
  { label: "Orders", to: "/dashboard/seller/orders", icon: "fa-cart-flatbed" },
  { label: "Earnings", to: "/dashboard/seller/earnings", icon: "fa-wallet" },
  { label: "Settings", to: "/dashboard/seller/settings", icon: "fa-user-gear" },
];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildMonthly(bookings: StoredBooking[]) {
  const map: Record<string, { gross: number; net: number; orders: number }> = {};
  bookings
    .filter((b) => b.status === "completed")
    .forEach((b) => {
      const d = new Date(b.createdAt);
      const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
      if (!map[key]) map[key] = { gross: 0, net: 0, orders: 0 };
      map[key].gross += b.price;
      map[key].net += Math.round(b.price * 0.9);
      map[key].orders += 1;
    });
  return Object.entries(map)
    .sort(([a], [b]) => new Date("1 " + a).getTime() - new Date("1 " + b).getTime())
    .map(([month, v]) => ({ month: month.split(" ")[0], ...v }));
}

function buildWeekly(bookings: StoredBooking[]) {
  const totals = Array(7).fill(0);
  bookings
    .filter((b) => b.status === "completed")
    .forEach((b) => {
      const day = new Date(b.createdAt).getDay();
      totals[day] += b.price;
    });
  return DAY_NAMES.map((day, i) => ({ day, amount: totals[i] }));
}

function buildTopServices(bookings: StoredBooking[]) {
  const map: Record<string, { revenue: number; orders: number }> = {};
  bookings
    .filter((b) => b.status === "completed")
    .forEach((b) => {
      if (!map[b.serviceTitle]) map[b.serviceTitle] = { revenue: 0, orders: 0 };
      map[b.serviceTitle].revenue += b.price;
      map[b.serviceTitle].orders += 1;
    });
  const total = Object.values(map).reduce((s, v) => s + v.revenue, 0) || 1;
  return Object.entries(map)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 3)
    .map(([name, v]) => ({ name, ...v, share: Math.round((v.revenue / total) * 100) }));
}

export default function SellerEarnings() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [bookings, setBookings] = useState<StoredBooking[]>([]);

  useEffect(() => { setBookings(getBookings()); }, []);

  const monthly = useMemo(() => buildMonthly(bookings), [bookings]);
  const weekly = useMemo(() => buildWeekly(bookings), [bookings]);
  const topServices = useMemo(() => buildTopServices(bookings), [bookings]);

  const completed = bookings.filter((b) => b.status === "completed");
  const totalNet = completed.reduce((s, b) => s + Math.round(b.price * 0.9), 0);
  const totalGross = completed.reduce((s, b) => s + b.price, 0);

  const currentMonth = monthly[monthly.length - 1];
  const prevMonth = monthly[monthly.length - 2];
  const growthPct = currentMonth && prevMonth && prevMonth.net > 0
    ? Math.round(((currentMonth.net - prevMonth.net) / prevMonth.net) * 100)
    : 0;

  const requestPayout = () => {
    setRequestingPayout(true);
    setTimeout(() => {
      setRequestingPayout(false);
      toast.success("Payout requested! Funds will arrive within 1–2 business days.");
    }, 1200);
  };

  const hasData = completed.length > 0;

  return (
    <DashboardShell role="Verified Seller" sidebarItems={sellerSidebarItems}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Earnings</h1>
          <p className="text-slate-500 font-medium mt-1">Your income summary and payout history.</p>
        </div>
        <button
          onClick={requestPayout}
          disabled={requestingPayout || !hasData}
          className="flex items-center gap-2 bg-gradient-brand text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-glow hover:scale-105 transition disabled:opacity-70 disabled:scale-100"
        >
          {requestingPayout ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-bolt" />}
          {requestingPayout ? "Processing..." : "Request Payout"}
        </button>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Available Balance", val: formatPrice(totalNet), icon: "fa-wallet", color: "text-emerald-600", bg: "bg-emerald-50", highlight: true },
          { label: "This Month", val: currentMonth ? formatPrice(currentMonth.net) : "Rs. 0", icon: "fa-calendar", color: "text-blue-600", bg: "bg-blue-50", highlight: false },
          { label: "Growth vs Last Month", val: prevMonth ? `${growthPct >= 0 ? "+" : ""}${growthPct}%` : "—", icon: "fa-arrow-trend-up", color: "text-violet-600", bg: "bg-violet-50", highlight: false },
          { label: "Total Earned", val: formatPrice(totalNet), icon: "fa-coins", color: "text-amber-600", bg: "bg-amber-50", highlight: false },
        ].map((s) => (
          <div key={s.label} className={`p-5 rounded-3xl border ${s.highlight ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200"} shadow-soft`}>
            <div className={`w-10 h-10 rounded-xl grid place-items-center mb-3 ${s.highlight ? "bg-white/10" : s.bg}`}>
              <i className={`fas ${s.icon} text-sm ${s.highlight ? "text-white" : s.color}`} />
            </div>
            <div className="text-[10px] font-black uppercase tracking-wider mb-1 text-slate-400">{s.label}</div>
            <div className={`text-xl font-black ${s.highlight ? "text-white" : "text-slate-900"}`}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Needly fee note */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 flex items-center gap-3 mb-8 text-sm">
        <i className="fas fa-circle-info text-blue-500" />
        <span className="text-blue-800">Needlyy charges a <strong>10% platform fee</strong> on completed orders. Your net earnings already reflect this deduction.</span>
      </div>

      {!hasData ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
          <i className="fas fa-wallet text-5xl text-slate-200 mb-4" />
          <h3 className="text-lg font-black text-slate-400">No earnings yet</h3>
          <p className="text-sm text-slate-400 mt-1">Complete orders to start tracking your income here.</p>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Main chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-900">Earnings Trend</h3>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  {(["weekly", "monthly"] as const).map((p) => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${period === p ? "bg-white text-slate-900 shadow-soft" : "text-slate-400"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              {period === "monthly" ? (
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthly}>
                      <defs>
                        <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: "#94a3b8" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                        formatter={(v: number) => [formatPrice(v), "Net Earnings"]} />
                      <Area type="monotone" dataKey="net" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#netGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekly}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: "#94a3b8" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                        formatter={(v: number) => [formatPrice(v), "Earnings"]} />
                      <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={32}>
                        {weekly.map((entry, i) => <Cell key={i} fill={entry.amount === Math.max(...weekly.map((w) => w.amount)) ? "hsl(var(--primary))" : "#e2e8f0"} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top services */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6">
              <h3 className="font-black text-slate-900 mb-5">Revenue by Service</h3>
              {topServices.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No service data yet.</p>
              ) : (
                <div className="space-y-4">
                  {topServices.map((s, i) => (
                    <div key={s.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold text-slate-900 truncate pr-2">{s.name}</span>
                        <span className="text-sm font-black text-slate-900 shrink-0">{formatPrice(s.revenue)}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${s.share}%`, backgroundColor: ["hsl(var(--primary))", "#10b981", "#f59e0b"][i] }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">{s.orders} orders · {s.share}% of revenue</div>
                    </div>
                  ))}
                </div>
              )}

              {currentMonth && (
                <div className="mt-6 pt-5 border-t border-slate-100 space-y-2 text-sm">
                  {[
                    { label: "Gross Revenue", val: formatPrice(totalGross) },
                    { label: "Platform Fee (10%)", val: `− ${formatPrice(totalGross - totalNet)}` },
                    { label: "Net Payout", val: formatPrice(totalNet), bold: true },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between">
                      <span className="text-slate-400 font-semibold">{r.label}</span>
                      <span className={r.bold ? "font-black text-slate-900" : "font-bold text-slate-700"}>{r.val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Monthly breakdown table */}
          {monthly.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden mb-8">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-black text-slate-900">Monthly Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Month", "Orders", "Gross", "Fee", "Net Payout", "Growth"].map((h) => (
                        <th key={h} className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[...monthly].reverse().map((m, i) => {
                      const prevIdx = monthly.length - 2 - i;
                      const prev = monthly[prevIdx];
                      const growth = prev && prev.net > 0 ? Math.round(((m.net - prev.net) / prev.net) * 100) : null;
                      return (
                        <tr key={m.month + i} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 font-bold text-slate-900">{m.month}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{m.orders}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{formatPrice(m.gross)}</td>
                          <td className="px-6 py-4 text-sm text-rose-400">−{formatPrice(m.gross - m.net)}</td>
                          <td className="px-6 py-4 font-black text-slate-900">{formatPrice(m.net)}</td>
                          <td className="px-6 py-4">
                            {growth !== null ? (
                              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${growth >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                                {growth >= 0 ? "+" : ""}{growth}%
                              </span>
                            ) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Payout history placeholder */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900">Payout History</h3>
          <button onClick={() => toast.info("Add a bank account in Settings to change your payout method.")} className="text-sm font-bold text-primary hover:underline">
            <i className="fas fa-bank mr-1" /> Payout Settings
          </button>
        </div>
        <div className="text-center py-12 text-slate-400">
          <i className="fas fa-building-columns text-4xl mb-3" />
          <p className="text-sm font-semibold">No payouts processed yet.</p>
          <p className="text-xs mt-1">Complete orders and request a payout to see your history here.</p>
        </div>
      </div>
    </DashboardShell>
  );
}
