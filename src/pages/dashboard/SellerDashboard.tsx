import DashboardShell from "@/components/dashboard/DashboardShell";
import { formatPrice } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const sellerSidebarItems = [
  { label: "Overview", to: "/dashboard/seller", icon: "fa-chart-pie" },
  { label: "Services", to: "/dashboard/seller/services", icon: "fa-rectangle-list" },
  { label: "Orders", to: "/dashboard/seller/orders", icon: "fa-shopping-cart" },
  { label: "Analytics", to: "/dashboard/seller/analytics", icon: "fa-chart-simple" },
  { label: "Wallet", to: "/dashboard/seller/earnings", icon: "fa-wallet" },
  { label: "Messages", to: "/dashboard/seller/inbox", icon: "fa-comments" },
  { label: "Settings", to: "/dashboard/seller/settings", icon: "fa-sliders" },
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
  return (
    <DashboardShell role="Verified Seller" sidebarItems={sellerSidebarItems}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">
            Welcome back, <span className="text-primary">Saman.</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg">
            Your store is performing <span className="text-emerald-600">24% better</span> than last week.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-black text-sm">
            View Shop
          </Button>
          <Button className="h-14 px-8 rounded-2xl bg-gradient-brand text-primary-foreground font-black text-sm shadow-glow hover:scale-105 transition-all">
            <i className="fas fa-plus-circle mr-2" /> List New Service
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Revenue", val: formatPrice(142500), trend: "+12.5%", icon: "fa-sack-dollar", color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Orders", val: "14", trend: "+4", icon: "fa-briefcase-clock", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Views", val: "2,481", trend: "+124", icon: "fa-eye", color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Avg. Rating", val: "4.95", trend: "+0.2", icon: "fa-star", color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-soft hover:shadow-glass transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl grid place-items-center group-hover:scale-110 transition-transform`}>
                <i className={`fas ${stat.icon} text-lg`} />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px]">
                {stat.trend}
              </Badge>
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-2xl font-[900] text-slate-900 tabular-nums">{stat.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 mb-12">
        {/* Earnings Chart */}
        <div className="lg:col-span-8 bg-white p-8 md:p-10 rounded-[3rem] border border-slate-200 shadow-soft">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
              <div>
                <h3 className="font-black text-2xl text-slate-900">Revenue Analysis</h3>
                <p className="text-sm text-slate-500 font-bold mt-1">Daily earnings breakdown for the current week</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                 <Button variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase bg-white shadow-sm">Daily</Button>
                 <Button variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase text-slate-400">Monthly</Button>
              </div>
           </div>
           <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={earningsData}>
                    <defs>
                      <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fontWeight: 900, fill: '#64748b'}} 
                      dy={15} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 11, fontWeight: 700, fill: '#94a3b8'}} 
                    />
                    <Tooltip 
                       contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                       itemStyle={{ fontWeight: 900, color: 'hsl(var(--primary))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorAmt)" 
                    />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Messaging Quick View */}
        <div className="lg:col-span-4 bg-slate-950 text-white p-8 md:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
           <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[80px] rounded-full -mr-10 -mt-10" />
           <div className="relative z-10 flex flex-col h-full">
              <h3 className="font-black text-2xl mb-8">Direct Inquiries</h3>
              <div className="space-y-4 flex-1">
                 {[
                   { name: "Priyanka S.", msg: "Can you deliver the files in SVG?", time: "2m ago", unread: true },
                   { name: "Asanka K.", msg: "Available for a call today?", time: "1h ago", unread: false },
                   { name: "Malith D.", msg: "Perfect, let's proceed with the kit.", time: "3h ago", unread: false },
                   { name: "Sihara L.", msg: "I need a quote for 5 logos.", time: "5h ago", unread: false },
                 ].map((chat, i) => (
                   <div key={i} className={`p-4 rounded-2xl border transition-all cursor-pointer group ${chat.unread ? "bg-white/10 border-white/20" : "bg-white/5 border-white/5 hover:bg-white/10"}`}>
                      <div className="flex items-center justify-between mb-1">
                         <div className="text-sm font-black text-white group-hover:text-primary transition-colors">{chat.name}</div>
                         <div className="text-[9px] font-black text-slate-500 uppercase">{chat.time}</div>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 font-medium">{chat.msg}</p>
                   </div>
                 ))}
              </div>
              <Button className="w-full mt-8 bg-white text-slate-950 hover:bg-slate-200 rounded-xl font-black h-12 text-xs">
                View All Conversations
              </Button>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Recent Orders Table-like View */}
        <div className="lg:col-span-7 bg-white rounded-[3rem] border border-slate-200 shadow-soft overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-2xl text-slate-900">Recent Orders</h3>
            <Button variant="ghost" className="font-black text-primary text-xs uppercase tracking-widest">
              See All Orders
            </Button>
          </div>
          <div className="divide-y divide-slate-50 flex-1">
             {[
               { id: "#4821", buyer: "Amaya R.", service: "Modern Logo Design", price: 8500, status: "Active", color: "blue" },
               { id: "#4818", buyer: "Kasun J.", service: "Business Cards Pack", price: 3500, status: "Pending", color: "amber" },
               { id: "#4815", buyer: "Dimuthu N.", service: "Social Media Kit", price: 12000, status: "Delivered", color: "emerald" },
               { id: "#4812", buyer: "Rohan P.", service: "UI/UX Consultation", price: 15000, status: "Completed", color: "slate" },
             ].map((order) => (
               <div key={order.id} className="p-6 md:px-8 flex items-center justify-between hover:bg-slate-50/50 transition-all group cursor-pointer">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 grid place-items-center group-hover:scale-110 transition-transform">
                       <i className="fas fa-file-invoice-dollar text-slate-400" />
                    </div>
                    <div>
                       <div className="font-black text-slate-900 group-hover:text-primary transition-colors">{order.service}</div>
                       <div className="text-xs text-slate-400 font-bold mt-0.5">Ordered by {order.buyer} · {order.id}</div>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="font-[900] text-lg text-slate-900">{formatPrice(order.price)}</div>
                    <Badge className={`bg-${order.color}-500/10 text-${order.color}-600 border-none font-black text-[10px] uppercase mt-1`}>
                      {order.status}
                    </Badge>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Performance Sidebar */}
        <div className="lg:col-span-5 bg-white rounded-[3rem] border border-slate-200 shadow-soft p-8 md:p-10">
          <h3 className="font-black text-2xl text-slate-900 mb-8">Top Performing Services</h3>
          <div className="space-y-6">
             {[
               { name: "Modern Logo Design", views: 1242, orders: 42, conversion: "3.4%", color: "bg-blue-500" },
               { name: "Social Media Kit", views: 2104, orders: 67, conversion: "3.2%", color: "bg-primary" },
               { name: "Business Cards Pack", views: 856, orders: 12, conversion: "1.4%", color: "bg-slate-400" },
             ].map((s) => (
               <div key={s.name} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="font-black text-slate-900">{s.name}</div>
                    <div className="text-sm font-black text-primary">{s.conversion} CR</div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div className={`${s.color} h-full rounded-full transition-all duration-1000`} style={{ width: s.conversion.replace('%', '') + '0%' }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>{s.views} Views</span>
                    <span>{s.orders} Orders</span>
                  </div>
               </div>
             ))}
          </div>
          
          <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center">
             <i className="fas fa-chart-line text-4xl text-slate-200 mb-4" />
             <h4 className="font-black text-slate-900">Optimization Tip</h4>
             <p className="text-xs text-slate-500 font-bold mt-2 leading-relaxed">
               Adding more portfolio items to "Business Cards Pack" could increase conversion by up to 15%.
             </p>
             <Button variant="link" className="mt-2 font-black text-xs text-primary p-0">Learn More</Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
