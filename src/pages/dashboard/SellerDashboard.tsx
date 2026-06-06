import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { formatPrice } from "@/lib/format";
import { usePageTitle } from "@/lib/usePageTitle";
import { getBookings, getMyServices } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const sellerSidebarItems = [
  { label: "Overview", to: "/dashboard/seller", icon: "fa-chart-line" },
  { label: "My Services", to: "/dashboard/seller/services", icon: "fa-briefcase" },
  { label: "Orders", to: "/dashboard/seller/orders", icon: "fa-cart-flatbed" },
  { label: "Earnings", to: "/dashboard/seller/earnings", icon: "fa-wallet" },
  { label: "Settings", to: "/dashboard/seller/settings", icon: "fa-user-gear" },
];

function buildEarningsChart(days: number) {
  const now = new Date();
  const labels = Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    return days <= 7
      ? d.toLocaleDateString("en-US", { weekday: "short" })
      : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
  const bookings = getBookings();
  return labels.map((label, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    const dayStr = d.toISOString().split("T")[0];
    const amount = bookings
      .filter((b) => b.status === "completed" && b.createdAt.startsWith(dayStr))
      .reduce((sum, b) => sum + b.price, 0);
    return { label, amount };
  });
}

export default function SellerDashboard() {
  usePageTitle("Seller Dashboard");
  const [period, setPeriod] = useState<7 | 30>(7);
  const [earningsData, setEarningsData] = useState(() => buildEarningsChart(7));
  const [bookings, setBookings] = useState(() => getBookings());
  const [myServices, setMyServices] = useState(() => getMyServices());

  useEffect(() => {
    setEarningsData(buildEarningsChart(period));
    setBookings(getBookings());
    setMyServices(getMyServices());
  }, [period]);

  const activeOrders = bookings.filter((b) => b.status === "pending" || b.status === "in_progress" || b.status === "confirmed").length;
  const netEarnings = bookings.filter((b) => b.status === "completed").reduce((s, b) => s + b.price, 0);
  const recentOrders = bookings.slice(0, 3);

  return (
    <DashboardShell role="Verified Seller" sidebarItems={sellerSidebarItems}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Seller Dashboard</h1>
          <p className="text-slate-500 font-medium">Keep it up! Your response rate is 98% this week.</p>
        </div>
        <Link to="/dashboard/seller/new-service" className="bg-gradient-brand text-primary-foreground px-6 py-3 rounded-2xl font-bold shadow-glow hover:scale-105 transition flex items-center gap-2">
          <i className="fas fa-plus" /> Create New Service
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: "Active Orders", val: activeOrders.toString(), icon: "fa-clock-rotate-left", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Net Earnings", val: netEarnings > 0 ? formatPrice(netEarnings) : "Rs. 0", icon: "fa-wallet", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "My Services", val: myServices.length.toString(), icon: "fa-briefcase", color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-soft flex items-center gap-6">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl grid place-items-center shrink-0`}>
              <i className={`fas ${stat.icon} text-xl`} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
              <div className="text-2xl font-black text-slate-900">{stat.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Earnings Chart */}
      <div className="grid lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-soft">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-xl text-slate-900">Earnings Trends</h3>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                {([7, 30] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setPeriod(d)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${period === d ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                  >
                    {d === 7 ? "7 Days" : "30 Days"}
                  </button>
                ))}
              </div>
           </div>
           {earningsData.every((d) => d.amount === 0) && (
             <p className="text-xs text-slate-400 text-center mb-4">No completed bookings yet — data will appear here once orders are marked complete.</p>
           )}
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                    <Tooltip
                       cursor={{fill: 'transparent'}}
                       contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={32}>
                       {earningsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.amount > 0 ? 'hsl(var(--primary))' : '#e2e8f0'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-soft">
           <h3 className="font-black text-xl text-slate-900 mb-6">Recent Inquiries</h3>
           <div className="space-y-4">
              {[
                { name: "Priyanka S.", msg: "Hi, can you deliver the logo files in SVG format?", time: "2m ago", unread: true },
                { name: "Asanka K.", msg: "Is the AC servicing available this weekend?", time: "1h ago", unread: false },
                { name: "Malith D.", msg: "Thanks for the quick response! I'll proceed.", time: "3h ago", unread: false },
              ].map((chat, i) => (
                <div key={i} className={`p-4 rounded-2xl border transition cursor-pointer ${chat.unread ? "bg-primary/5 border-primary/20" : "bg-white border-slate-50 hover:border-slate-200"}`}>
                   <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-black text-slate-900">{chat.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">{chat.time}</div>
                   </div>
                   <p className="text-xs text-slate-500 line-clamp-1">{chat.msg}</p>
                </div>
              ))}
           </div>
           <Link to="/dashboard/seller/inbox" className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition">
              <i className="fas fa-inbox" /> Open Inbox
           </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-soft overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-xl text-slate-900">Recent Orders</h3>
            <Link to="/dashboard/seller/orders" className="text-sm font-bold text-primary hover:underline">Manage All</Link>
          </div>
          <div className="divide-y divide-slate-50">
             {recentOrders.length === 0 ? (
               <div className="p-8 text-center text-slate-400 text-sm">No orders yet. Share your services to start receiving bookings.</div>
             ) : recentOrders.map((order) => {
               const statusColors: Record<string, string> = {
                 pending: "text-amber-500 bg-amber-50",
                 confirmed: "text-blue-500 bg-blue-50",
                 in_progress: "text-violet-500 bg-violet-50",
                 completed: "text-emerald-500 bg-emerald-50",
                 cancelled: "text-red-500 bg-red-50",
               };
               return (
                 <div key={order.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 grid place-items-center">
                         <i className="fas fa-file-invoice text-slate-400" />
                      </div>
                      <div>
                         <div className="font-bold text-slate-900 line-clamp-1">{order.serviceTitle}</div>
                         <div className="text-xs text-slate-400 font-semibold">by {order.customerName} · {order.id}</div>
                      </div>
                   </div>
                   <div className="text-right shrink-0">
                      <div className="font-black text-slate-900">{formatPrice(order.price)}</div>
                      <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md mt-1 inline-block ${statusColors[order.status] ?? "text-slate-500 bg-slate-100"}`}>{order.status.replace("_", " ")}</div>
                   </div>
                 </div>
               );
             })}
          </div>
        </div>

        {/* My Services Quick View */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-soft p-8">
          <h3 className="font-black text-xl text-slate-900 mb-6">Service Performance</h3>
          <div className="space-y-5">
             {myServices.length === 0 ? (
               <p className="text-sm text-slate-400 text-center py-4">Create services to see performance data here.</p>
             ) : myServices.slice(0, 3).map((s) => {
               const conv = s.views > 0 ? ((s.orders / s.views) * 100).toFixed(1) + "%" : "0%";
               return (
                 <div key={s.id} className="p-5 border border-slate-100 rounded-2xl">
                    <div className="font-bold text-slate-900 mb-3 line-clamp-1">{s.title}</div>
                    <div className="grid grid-cols-3 gap-4">
                       <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Views</div>
                          <div className="text-sm font-black text-slate-700">{s.views}</div>
                       </div>
                       <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Orders</div>
                          <div className="text-sm font-black text-slate-700">{s.orders}</div>
                       </div>
                       <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Conv.</div>
                          <div className="text-sm font-black text-primary">{conv}</div>
                       </div>
                    </div>
                 </div>
               );
             })}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
