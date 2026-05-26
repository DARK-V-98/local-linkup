import { Link } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { formatPrice } from "@/lib/format";
import { usePageTitle } from "@/lib/usePageTitle";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const sellerSidebarItems = [
  { label: "Overview", to: "/dashboard/seller", icon: "fa-chart-line" },
  { label: "My Services", to: "/dashboard/seller/services", icon: "fa-briefcase" },
  { label: "Orders", to: "/dashboard/seller/orders", icon: "fa-cart-flatbed" },
  { label: "Earnings", to: "/dashboard/seller/earnings", icon: "fa-wallet" },
  { label: "Settings", to: "/dashboard/seller/settings", icon: "fa-user-gear" },
];

const earningsData = [
  { day: 'Mon', amount: 12000 },
  { day: 'Tue', amount: 18000 },
  { day: 'Wed', amount: 15000 },
  { day: 'Thu', amount: 22000 },
  { day: 'Fri', amount: 31000 },
  { day: 'Sat', amount: 28000 },
  { day: 'Sun', amount: 16500 },
];

export default function SellerDashboard() {
  usePageTitle("Seller Dashboard");
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
          { label: "Active Orders", val: "14", icon: "fa-clock-rotate-left", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Net Earnings", val: formatPrice(142500), icon: "fa-wallet", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Profile Rating", val: "4.9/5", icon: "fa-star", color: "text-amber-600", bg: "bg-amber-50" },
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
              <select className="bg-slate-100 border-none text-xs font-bold rounded-xl px-3 py-1.5 focus:ring-0">
                 <option>Last 7 Days</option>
                 <option>Last 30 Days</option>
              </select>
           </div>
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                    <Tooltip 
                       cursor={{fill: 'transparent'}}
                       contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={32}>
                       {earningsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 4 ? 'hsl(var(--primary))' : '#e2e8f0'} />
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
             {[
               { id: "#4821", buyer: "Amaya R.", service: "Modern Logo Design", price: 8500, status: "In Progress", statusColor: "text-blue-500 bg-blue-50" },
               { id: "#4818", buyer: "Kasun J.", service: "Business Cards Pack", price: 3500, status: "Pending", statusColor: "text-amber-500 bg-amber-50" },
               { id: "#4815", buyer: "Dimuthu N.", service: "Social Media Kit", price: 12000, status: "Completed", statusColor: "text-emerald-500 bg-emerald-50" },
             ].map((order) => (
               <div key={order.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 grid place-items-center">
                       <i className="fas fa-file-invoice text-slate-400" />
                    </div>
                    <div>
                       <div className="font-bold text-slate-900">{order.service}</div>
                       <div className="text-xs text-slate-400 font-semibold">Ordered by {order.buyer} · {order.id}</div>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="font-black text-slate-900">{formatPrice(order.price)}</div>
                    <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md mt-1 inline-block ${order.statusColor}`}>{order.status}</div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* My Services Quick View */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-soft p-8">
          <h3 className="font-black text-xl text-slate-900 mb-6">Service Performance</h3>
          <div className="space-y-5">
             {[
               { name: "Modern Logo Design", views: 1242, orders: 42, conversion: "3.4%" },
               { name: "Business Cards Pack", views: 856, orders: 12, conversion: "1.4%" },
               { name: "Social Media Kit", views: 2104, orders: 67, conversion: "3.2%" },
             ].map((s) => (
               <div key={s.name} className="p-5 border border-slate-100 rounded-2xl">
                  <div className="font-bold text-slate-900 mb-3">{s.name}</div>
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
                        <div className="text-sm font-black text-primary">{s.conversion}</div>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
