import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { formatPrice } from "@/lib/format";
import { usePageTitle } from "@/lib/usePageTitle";
import { getBookings, StoredBooking } from "@/lib/store";
import { getSaved } from "@/lib/saved";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const buyerSidebarItems = [
  { label: "Overview", to: "/dashboard/buyer", icon: "fa-house-user" },
  { label: "My Bookings", to: "/dashboard/buyer/orders", icon: "fa-bag-shopping" },
  { label: "Saved Sellers", to: "/dashboard/buyer/saved", icon: "fa-heart" },
  { label: "Payments", to: "/dashboard/buyer/payments", icon: "fa-credit-card" },
  { label: "Settings", to: "/dashboard/buyer/settings", icon: "fa-user-gear" },
];

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#84cc16"];

function buildSpending(bookings: StoredBooking[]) {
  const map: Record<string, number> = {};
  bookings.filter((b) => b.status !== "cancelled").forEach((b) => {
    map[b.category] = (map[b.category] ?? 0) + b.price;
  });
  return Object.entries(map).map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }));
}

export default function BuyerDashboard() {
  usePageTitle("Buyer Dashboard");
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    setBookings(getBookings());
    setSavedCount(getSaved().length);
  }, []);

  const activeBookings = bookings.filter((b) => ["pending", "confirmed", "in_progress"].includes(b.status));
  const totalSpent = bookings.filter((b) => b.status === "completed").reduce((s, b) => s + b.price, 0);
  const spendingData = buildSpending(bookings);

  return (
    <DashboardShell role="Premium Buyer" sidebarItems={buyerSidebarItems}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Buyer Dashboard</h1>
          <p className="text-slate-500 font-medium">Manage your orders and stay in touch with your pros.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-soft">
            <div className="text-xl font-black text-slate-900">{activeBookings.length}</div>
            <div className="text-xs text-slate-400 font-bold">Active</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-soft">
            <div className="text-xl font-black text-slate-900">{savedCount}</div>
            <div className="text-xs text-slate-400 font-bold">Saved</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-soft">
            <div className="text-xl font-black text-slate-900">{formatPrice(totalSpent)}</div>
            <div className="text-xs text-slate-400 font-bold">Spent</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Bookings */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-soft p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-xl text-slate-900">Active Bookings</h3>
              <Link to="/dashboard/buyer/orders" className="text-sm font-bold text-primary hover:underline">See All</Link>
            </div>
            <div className="space-y-4">
               {activeBookings.length === 0 ? (
                 <div className="text-center py-8 text-slate-400 text-sm">
                   No active bookings yet.{" "}
                   <Link to="/browse" className="text-primary font-semibold hover:underline">Find a service</Link>
                 </div>
               ) : activeBookings.map((b) => {
                 const progressMap: Record<string, number> = { pending: 10, confirmed: 35, in_progress: 65 };
                 return (
                   <div key={b.id} className="p-6 border border-slate-100 rounded-2xl hover:border-primary/20 transition group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white grid place-items-center shrink-0">
                               <i className={`fas ${b.categoryIcon ?? "fa-hammer"}`} />
                            </div>
                            <div className="min-w-0">
                               <div className="font-bold text-slate-900 group-hover:text-primary transition line-clamp-1">{b.serviceTitle}</div>
                               <div className="text-xs text-slate-400 font-semibold">with {b.vendorName} · {b.date}</div>
                            </div>
                         </div>
                         <div className="text-right shrink-0">
                            <div className="font-black text-slate-900 mb-1">{formatPrice(b.price)}</div>
                            <div className="text-[10px] font-black uppercase text-primary mb-1">{b.status.replace("_", " ")}</div>
                            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progressMap[b.status] ?? 10}%` }} />
                            </div>
                         </div>
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-3 gap-4">
             {[
               { label: "Find new Pro", icon: "fa-magnifying-glass", to: "/browse", color: "text-blue-500", bg: "bg-blue-50" },
               { label: "Emergency Help", icon: "fa-triangle-exclamation", to: "/emergency", color: "text-red-500", bg: "bg-red-50" },
               { label: "My Bookings", icon: "fa-list-check", to: "/dashboard/buyer/orders", color: "text-emerald-500", bg: "bg-emerald-50" },
             ].map((a) => (
               <Link key={a.label} to={a.to} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-soft hover:shadow-glow transition text-center group">
                  <div className={`w-12 h-12 ${a.bg} ${a.color} rounded-2xl grid place-items-center mx-auto mb-3 group-hover:scale-110 transition`}>
                     <i className={`fas ${a.icon}`} />
                  </div>
                  <div className="text-sm font-bold text-slate-700">{a.label}</div>
               </Link>
             ))}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
           {/* Spending Breakdown */}
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-soft p-8">
              <h3 className="font-black text-xl text-slate-900 mb-6">Spending</h3>
              {spendingData.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No spending data yet.</div>
              ) : (
                <>
                  <div className="h-48 w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={spendingData}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                           >
                              {spendingData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                           </Pie>
                           <Tooltip
                              contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                           />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 mt-4">
                     {spendingData.map((s) => (
                        <div key={s.name} className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                              <span className="text-xs font-bold text-slate-600">{s.name}</span>
                           </div>
                           <span className="text-xs font-black text-slate-900">{formatPrice(s.value)}</span>
                        </div>
                     ))}
                  </div>
                </>
              )}
           </div>

           {/* Wallet */}
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 dot-pattern-light opacity-20" />
              <div className="relative">
                 <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Needlyy Wallet</div>
                 <div className="text-3xl font-black">{formatPrice(12400)}</div>
                 <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">Available for your next booking. Top up to get 5% cashback on local services.</p>
                 <Link to="/dashboard/buyer/payments" className="w-full mt-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm shadow-glow flex items-center justify-center gap-2 hover:bg-slate-50 transition">
                   <i className="fas fa-plus-circle" /> Top up Wallet
                 </Link>
              </div>
           </div>

           {/* Saved Sellers */}
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-soft p-8">
              <h3 className="font-black text-xl text-slate-900 mb-4">Saved Services</h3>
              {savedCount === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">
                  No saved services yet.{" "}
                  <Link to="/browse" className="text-primary font-semibold hover:underline">Browse now</Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-4xl font-black text-slate-900">{savedCount}</div>
                  <div className="text-sm text-slate-400 mt-1">saved service{savedCount !== 1 ? "s" : ""}</div>
                </div>
              )}
              <Link to="/dashboard/buyer/saved" className="w-full mt-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition flex items-center justify-center gap-2">
                <i className="fas fa-heart text-rose-400 text-xs" /> View All Saved
              </Link>
           </div>
        </div>
      </div>
    </DashboardShell>
  );
}
