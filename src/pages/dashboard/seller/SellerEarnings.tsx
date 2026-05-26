import DashboardShell from "@/components/dashboard/DashboardShell";
import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";

const sellerSidebarItems = [
  { label: "Overview", to: "/dashboard/seller", icon: "fa-chart-line" },
  { label: "My Services", to: "/dashboard/seller/services", icon: "fa-briefcase" },
  { label: "Orders", to: "/dashboard/seller/orders", icon: "fa-cart-flatbed" },
  { label: "Earnings", to: "/dashboard/seller/earnings", icon: "fa-wallet" },
  { label: "Settings", to: "/dashboard/seller/settings", icon: "fa-user-gear" },
];

const MONTHLY = [
  { month: "May", gross: 58000, net: 52200, orders: 11 },
  { month: "Jun", gross: 72000, net: 64800, orders: 14 },
  { month: "Jul", gross: 65000, net: 58500, orders: 13 },
  { month: "Aug", gross: 89000, net: 80100, orders: 17 },
  { month: "Sep", gross: 95000, net: 85500, orders: 19 },
  { month: "Oct", gross: 142500, net: 128250, orders: 26 },
];

const WEEKLY = [
  { day: "Mon", amount: 12000 },
  { day: "Tue", amount: 18000 },
  { day: "Wed", amount: 15000 },
  { day: "Thu", amount: 22000 },
  { day: "Fri", amount: 31000 },
  { day: "Sat", amount: 28000 },
  { day: "Sun", amount: 16500 },
];

const PAYOUTS = [
  { id: "PO-441", date: "Oct 1, 2024", amount: 95000, method: "Sampath Bank ****1234", status: "completed" },
  { id: "PO-440", date: "Sep 1, 2024", amount: 85500, method: "Sampath Bank ****1234", status: "completed" },
  { id: "PO-439", date: "Aug 1, 2024", amount: 80100, method: "Sampath Bank ****1234", status: "completed" },
  { id: "PO-438", date: "Jul 1, 2024", amount: 58500, method: "Sampath Bank ****1234", status: "completed" },
];

const TOP_SERVICES = [
  { name: "Modern Logo Design", revenue: 68000, orders: 8, share: 48 },
  { name: "Social Media Kit", revenue: 48000, orders: 4, share: 34 },
  { name: "Business Cards Pack", revenue: 26500, orders: 7, share: 18 },
];

export default function SellerEarnings() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");
  const [requestingPayout, setRequestingPayout] = useState(false);

  const currentMonth = MONTHLY[MONTHLY.length - 1];
  const prevMonth = MONTHLY[MONTHLY.length - 2];
  const growthPct = Math.round(((currentMonth.net - prevMonth.net) / prevMonth.net) * 100);

  const requestPayout = () => {
    setRequestingPayout(true);
    setTimeout(() => {
      setRequestingPayout(false);
      toast.success("Payout requested! Funds will arrive within 1–2 business days.");
    }, 1200);
  };

  return (
    <DashboardShell role="Verified Seller" sidebarItems={sellerSidebarItems}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Earnings</h1>
          <p className="text-slate-500 font-medium mt-1">Your income summary and payout history.</p>
        </div>
        <button
          onClick={requestPayout}
          disabled={requestingPayout}
          className="flex items-center gap-2 bg-gradient-brand text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-glow hover:scale-105 transition disabled:opacity-70 disabled:scale-100"
        >
          {requestingPayout ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-bolt" />}
          {requestingPayout ? "Processing..." : "Request Payout"}
        </button>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Available Balance", val: formatPrice(128250), icon: "fa-wallet", color: "text-emerald-600", bg: "bg-emerald-50", highlight: true },
          { label: "This Month", val: formatPrice(currentMonth.net), icon: "fa-calendar", color: "text-blue-600", bg: "bg-blue-50", highlight: false },
          { label: "Growth vs Last Month", val: `+${growthPct}%`, icon: "fa-arrow-trend-up", color: "text-violet-600", bg: "bg-violet-50", highlight: false },
          { label: "Total Earned", val: "Rs. 469K+", icon: "fa-coins", color: "text-amber-600", bg: "bg-amber-50", highlight: false },
        ].map((s) => (
          <div key={s.label} className={`p-5 rounded-3xl border ${s.highlight ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200"} shadow-soft`}>
            <div className={`w-10 h-10 rounded-xl grid place-items-center mb-3 ${s.highlight ? "bg-white/10" : s.bg}`}>
              <i className={`fas ${s.icon} text-sm ${s.highlight ? "text-white" : s.color}`} />
            </div>
            <div className={`text-[10px] font-black uppercase tracking-wider mb-1 ${s.highlight ? "text-slate-400" : "text-slate-400"}`}>{s.label}</div>
            <div className={`text-xl font-black ${s.highlight ? "text-white" : "text-slate-900"}`}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Needly fee note */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 flex items-center gap-3 mb-8 text-sm">
        <i className="fas fa-circle-info text-blue-500" />
        <span className="text-blue-800">Needlyy charges a <strong>10% platform fee</strong> on completed orders. Your net earnings already reflect this deduction.</span>
      </div>

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
                <AreaChart data={MONTHLY}>
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
                <BarChart data={WEEKLY}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: "#94a3b8" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: "#94a3b8" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    formatter={(v: number) => [formatPrice(v), "Earnings"]} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={32}>
                    {WEEKLY.map((_, i) => <Cell key={i} fill={i === 4 ? "hsl(var(--primary))" : "#e2e8f0"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top services */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6">
          <h3 className="font-black text-slate-900 mb-5">Revenue by Service</h3>
          <div className="space-y-4">
            {TOP_SERVICES.map((s, i) => (
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

          <div className="mt-6 pt-5 border-t border-slate-100 space-y-2 text-sm">
            {[
              { label: "Gross Revenue", val: formatPrice(currentMonth.gross) },
              { label: "Platform Fee (10%)", val: `− ${formatPrice(currentMonth.gross - currentMonth.net)}` },
              { label: "Net Payout", val: formatPrice(currentMonth.net), bold: true },
            ].map((r) => (
              <div key={r.label} className="flex justify-between">
                <span className="text-slate-400 font-semibold">{r.label}</span>
                <span className={r.bold ? "font-black text-slate-900" : "font-bold text-slate-700"}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly breakdown table */}
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
              {[...MONTHLY].reverse().map((m, i) => {
                const prev = MONTHLY[MONTHLY.length - 2 - i];
                const growth = prev ? Math.round(((m.net - prev.net) / prev.net) * 100) : null;
                return (
                  <tr key={m.month} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{m.month} 2024</td>
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

      {/* Payout history */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900">Payout History</h3>
          <button onClick={() => toast.info("Add a bank account in Settings to change your payout method.")} className="text-sm font-bold text-primary hover:underline">
            <i className="fas fa-bank mr-1" /> Payout Settings
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {PAYOUTS.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center">
                  <i className="fas fa-building-columns text-sm" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{p.method}</div>
                  <div className="text-xs text-slate-400">{p.date} · #{p.id}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-emerald-600">+{formatPrice(p.amount)}</div>
                <div className="text-[10px] font-bold uppercase text-emerald-500 mt-0.5">{p.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
