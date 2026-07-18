import DashboardShell from "@/components/dashboard/DashboardShell";
import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { type StoredBooking } from "@/lib/store";
import { useBookings } from "@/hooks/useBookings";
import { usePageTitle } from "@/lib/usePageTitle";

// Payout history — localStorage persisted
interface PayoutRecord {
  id: string;
  amount: number;
  bank: string;
  accountNo: string;
  requestedAt: string;
  status: "pending" | "processing" | "completed" | "rejected";
}
const PAYOUT_KEY = "needly_payout_history";
function getPayouts(): PayoutRecord[] {
  try { return JSON.parse(localStorage.getItem(PAYOUT_KEY) ?? "[]"); } catch { return []; }
}
function savePayout(p: PayoutRecord) {
  const all = getPayouts();
  all.unshift(p);
  localStorage.setItem(PAYOUT_KEY, JSON.stringify(all));
}

const SL_BANKS = [
  "Bank of Ceylon (BOC)", "People's Bank", "Commercial Bank", "Sampath Bank",
  "HNB (Hatton National Bank)", "NSB (National Savings Bank)", "Seylan Bank",
  "NDB Bank", "Pan Asia Bank", "Amana Bank", "DFCC Bank", "Nations Trust Bank",
];

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
  usePageTitle("My Earnings");
  const [period, setPeriod] = useState<"weekly" | "monthly">("monthly");
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const { bookings } = useBookings() as { bookings: StoredBooking[] };
  const [payouts, setPayouts] = useState<PayoutRecord[]>(getPayouts());
  const [payoutForm, setPayoutForm] = useState({
    bank: "",
    accountNo: "",
    accountName: "",
    branch: "",
    amount: "",
  });


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

  const submitPayout = () => {
    if (!payoutForm.bank || !payoutForm.accountNo || !payoutForm.accountName) {
      toast.error("Please fill in all bank details.");
      return;
    }
    const amount = parseInt(payoutForm.amount) || totalNet;
    if (amount > totalNet) { toast.error("Payout amount exceeds available balance."); return; }
    if (amount < 500)       { toast.error("Minimum payout is Rs. 500."); return; }

    setRequestingPayout(true);
    setTimeout(() => {
      const record: PayoutRecord = {
        id: "PO-" + Date.now(),
        amount,
        bank: payoutForm.bank,
        accountNo: payoutForm.accountNo,
        requestedAt: new Date().toISOString(),
        status: "pending",
      };
      savePayout(record);
      setPayouts(getPayouts());
      setRequestingPayout(false);
      setShowPayoutModal(false);
      setPayoutForm({ bank: "", accountNo: "", accountName: "", branch: "", amount: "" });
      toast.success(`Payout of ${formatPrice(amount)} requested! Arrives in 1–2 business days.`);
    }, 1400);
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
          onClick={() => setShowPayoutModal(true)}
          disabled={!hasData || totalNet === 0}
          className="flex items-center gap-2 bg-gradient-brand text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-glow hover:scale-105 transition disabled:opacity-70 disabled:scale-100"
        >
          <i className="fas fa-bolt" /> Request Payout
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

      {/* Payout history */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900">Payout History</h3>
          <button
            onClick={() => setShowPayoutModal(true)}
            disabled={!hasData || totalNet === 0}
            className="text-sm font-bold text-primary hover:underline disabled:opacity-40"
          >
            <i className="fas fa-plus mr-1" /> Request Payout
          </button>
        </div>
        {payouts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <i className="fas fa-building-columns text-4xl mb-3" />
            <p className="text-sm font-semibold">No payouts requested yet.</p>
            <p className="text-xs mt-1">Complete orders then request a payout to see history here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {payouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-5 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${
                    p.status === "completed"  ? "bg-emerald-50 text-emerald-600" :
                    p.status === "processing" ? "bg-blue-50 text-blue-600" :
                    p.status === "rejected"   ? "bg-rose-50 text-rose-500" :
                    "bg-amber-50 text-amber-600"
                  }`}>
                    <i className={`fas ${
                      p.status === "completed"  ? "fa-circle-check" :
                      p.status === "processing" ? "fa-spinner" :
                      p.status === "rejected"   ? "fa-xmark" :
                      "fa-clock"
                    } text-sm`} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{p.bank}</div>
                    <div className="text-xs text-slate-400">
                      Account ****{p.accountNo.slice(-4)} ·{" "}
                      {new Date(p.requestedAt).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900 text-sm">{formatPrice(p.amount)}</div>
                  <div className={`text-[10px] font-bold uppercase mt-0.5 capitalize ${
                    p.status === "completed"  ? "text-emerald-500" :
                    p.status === "processing" ? "text-blue-500" :
                    p.status === "rejected"   ? "text-rose-500" :
                    "text-amber-500"
                  }`}>{p.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-lg">Request Payout</h3>
              <button onClick={() => setShowPayoutModal(false)} className="w-8 h-8 rounded-xl bg-slate-100 grid place-items-center hover:bg-slate-200 transition">
                <i className="fas fa-xmark text-slate-500 text-sm" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Available balance */}
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Available Balance</div>
                  <div className="text-2xl font-black text-slate-900 mt-0.5">{formatPrice(totalNet)}</div>
                </div>
                <i className="fas fa-wallet text-3xl text-slate-200" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">Bank *</label>
                <select
                  value={payoutForm.bank}
                  onChange={(e) => setPayoutForm({ ...payoutForm, bank: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select your bank</option>
                  {SL_BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">Account Number *</label>
                  <input
                    value={payoutForm.accountNo}
                    onChange={(e) => setPayoutForm({ ...payoutForm, accountNo: e.target.value })}
                    placeholder="e.g. 0123456789"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">Branch</label>
                  <input
                    value={payoutForm.branch}
                    onChange={(e) => setPayoutForm({ ...payoutForm, branch: e.target.value })}
                    placeholder="e.g. Colombo 03"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">Account Holder Name *</label>
                <input
                  value={payoutForm.accountName}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountName: e.target.value })}
                  placeholder="As it appears on your bank account"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wide">Amount (Rs.) — leave blank for full balance</label>
                <input
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                  placeholder={`Max: ${totalNet.toLocaleString()}`}
                  type="number"
                  min="500"
                  max={totalNet}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-800">
                <i className="fas fa-clock text-blue-500 mt-0.5" />
                Payouts are processed within <strong>1–2 business days</strong>. A 10% platform fee is already deducted from your displayed balance.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 py-3.5 border border-slate-200 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitPayout}
                  disabled={requestingPayout}
                  className="flex-1 bg-gradient-brand text-primary-foreground py-3.5 rounded-2xl font-bold text-sm shadow-glow hover:scale-[1.02] transition disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {requestingPayout
                    ? <><i className="fas fa-spinner fa-spin" /> Processing...</>
                    : <><i className="fas fa-bolt" /> Request Payout</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
