import DashboardShell from "@/components/dashboard/DashboardShell";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const adminSidebarItems = [
  { label: "Overview", to: "/admin", icon: "fa-chart-pie" },
  { label: "Verifications", to: "/admin/verifications", icon: "fa-user-check" },
  { label: "Users", to: "/admin/users", icon: "fa-users" },
  { label: "Services", to: "/admin/services", icon: "fa-layer-group" },
  { label: "Disputes", to: "/admin/disputes", icon: "fa-circle-exclamation" },
  { label: "Settings", to: "/admin/settings", icon: "fa-gears" },
];

const data = [
  { name: 'Mon', revenue: 4000, users: 240 },
  { name: 'Tue', revenue: 3000, users: 139 },
  { name: 'Wed', revenue: 2000, users: 980 },
  { name: 'Thu', revenue: 2780, users: 390 },
  { name: 'Fri', revenue: 1890, users: 480 },
  { name: 'Sat', revenue: 2390, users: 380 },
  { name: 'Sun', revenue: 3490, users: 430 },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("revenue");

  return (
    <DashboardShell role="System Admin" sidebarItems={adminSidebarItems}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">
            System <span className="text-primary">Control.</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg">
            Platform health is <span className="text-emerald-600">optimal</span>. 12 pending verifications.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          {["revenue", "users", "orders"].map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? "default" : "ghost"}
              className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-slate-950 text-white shadow-xl" : "text-slate-400"}`}
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      {/* Authority Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Weekly Revenue", val: "LKR 1.2M", icon: "fa-money-bill-trend-up", color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12.5%" },
          { label: "Active Orders", val: "428", icon: "fa-cart-shopping", color: "text-blue-600", bg: "bg-blue-50", trend: "+8.2%" },
          { label: "Pending Pros", val: "12", icon: "fa-user-clock", color: "text-amber-600", bg: "bg-amber-50", trend: "+2.4%" },
          { label: "Disputes", val: "5", icon: "fa-triangle-exclamation", color: "text-rose-600", bg: "bg-rose-50", trend: "-1.5%" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-soft hover:shadow-glass transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
               <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl grid place-items-center group-hover:scale-110 transition-transform shadow-soft`}>
                 <i className={`fas ${stat.icon} text-xl`} />
               </div>
               <Badge className={`bg-${stat.trend.startsWith('+') ? "emerald" : "rose"}-500/10 text-${stat.trend.startsWith('+') ? "emerald" : "rose"}-600 border-none font-black text-[10px]`}>
                  {stat.trend}
               </Badge>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
            <div className="text-2xl font-[900] text-slate-900 tabular-nums">{stat.val}</div>
          </div>
        ))}
      </div>

      {/* Main Analytics Area */}
      <div className="bg-slate-950 text-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-12">
             <div>
               <h3 className="font-black text-2xl mb-2">Performance Analytics</h3>
               <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Real-time system throughput</p>
             </div>
             <Button variant="outline" className="h-12 px-6 rounded-xl border-white/10 text-white font-black text-xs hover:bg-white/5 transition-all">
               Export Data <i className="fas fa-download ml-2" />
             </Button>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 12, fontWeight: 900, fill: '#64748b'}} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fontWeight: 700, fill: '#475569'}} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', backgroundColor: '#0f172a', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)', padding: '1.5rem' }}
                  itemStyle={{ fontSize: '14px', fontWeight: '900', color: 'hsl(var(--primary))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={activeTab === 'revenue' ? 'revenue' : 'users'} 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#colorAdmin)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Verification Hub */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-200 shadow-soft overflow-hidden flex flex-col">
          <div className="p-8 md:p-10 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-2xl text-slate-900">Verification Hub</h3>
            <Badge className="bg-amber-500/10 text-amber-600 border-none font-black text-xs h-8 px-4">
              12 PENDING
            </Badge>
          </div>
          <div className="divide-y divide-slate-50 flex-1">
            {[
              { name: "Tharindu Perera", type: "Individual", city: "Colombo", date: "2 mins ago", icon: "fa-user-tie" },
              { name: "Lanka Homes (Pvt) Ltd", type: "Business", city: "Kandy", date: "15 mins ago", icon: "fa-building" },
              { name: "Kasun Jayasuriya", type: "Individual", city: "Galle", date: "1 hour ago", icon: "fa-user-tie" },
              { name: "Eco Cleaners", type: "Business", city: "Negombo", date: "3 hours ago", icon: "fa-building" },
            ].map((req) => (
              <div key={req.name} className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50/50 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white grid place-items-center group-hover:scale-110 transition-transform">
                    <i className={`fas ${req.icon} text-lg`} />
                  </div>
                  <div>
                    <div className="font-black text-xl text-slate-900 group-hover:text-primary transition-colors">{req.name}</div>
                    <div className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-widest">{req.type} · {req.city}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="h-11 px-4 rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all">
                    <i className="fas fa-check" />
                  </Button>
                  <Button variant="outline" className="h-11 px-4 rounded-xl border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white transition-all">
                    <i className="fas fa-xmark" />
                  </Button>
                  <div className="w-px h-8 bg-slate-100 mx-2 hidden sm:block" />
                  <Button className="h-11 px-6 rounded-xl bg-slate-950 text-white font-black text-xs uppercase tracking-widest">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Activity Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-[3rem] border border-slate-200 shadow-soft p-8 md:p-10 flex flex-col">
          <h3 className="font-black text-2xl text-slate-900 mb-10">System Activity</h3>
          <div className="space-y-8 flex-1">
            {[
              { icon: "fa-check-circle", color: "text-emerald-500", text: "Order #4122 completed.", time: "5m ago" },
              { icon: "fa-triangle-exclamation", color: "text-rose-500", text: "Dispute raised by Buyer #882.", time: "12m ago" },
              { icon: "fa-user-plus", color: "text-blue-500", text: "New registration: 'EcoClean'.", time: "45m ago" },
              { icon: "fa-star", color: "text-amber-500", text: "Seller 'Amila' reached Lvl 2.", time: "1h ago" },
              { icon: "fa-shield-halved", color: "text-indigo-500", text: "Security patch deployed.", time: "3h ago" },
            ].map((activity, i) => (
              <div key={i} className="flex gap-5 group">
                <div className={`mt-1.5 ${activity.color} group-hover:scale-125 transition-transform`}>
                  <i className={`fas ${activity.icon} text-lg`} />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-700 leading-tight group-hover:text-primary transition-colors">{activity.text}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-12 h-14 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50">
            View All Audit Logs
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
