import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { usePageTitle } from "@/lib/usePageTitle";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const adminSidebarItems = [
  { label: "Overview", to: "/admin", icon: "fa-chart-pie" },
  { label: "Verifications", to: "/admin/verifications", icon: "fa-user-check" },
  { label: "User Management", to: "/admin/users", icon: "fa-users" },
  { label: "Service Catalog", to: "/admin/services", icon: "fa-layer-group" },
  { label: "Disputes", to: "/admin/disputes", icon: "fa-circle-exclamation" },
  { label: "System Settings", to: "/admin/settings", icon: "fa-gears" },
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
  usePageTitle("Admin Dashboard");
  const [activeTab, setActiveTab] = useState("revenue");

  return (
    <DashboardShell role="System Admin" sidebarItems={adminSidebarItems}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 font-medium">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
          {["revenue", "users", "orders"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition ${activeTab === tab ? "bg-white text-slate-900 shadow-soft" : "text-slate-400 hover:text-slate-600"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Revenue", val: "LKR 1.2M", icon: "fa-money-bill-trend-up", color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12.5%" },
          { label: "Active Orders", val: "428", icon: "fa-cart-shopping", color: "text-blue-600", bg: "bg-blue-50", trend: "+8.2%" },
          { label: "New Sellers", val: "12", icon: "fa-user-plus", color: "text-amber-600", bg: "bg-amber-50", trend: "+2.4%" },
          { label: "Support Tickets", val: "5", icon: "fa-ticket", color: "text-rose-600", bg: "bg-rose-50", trend: "-1.5%" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-soft hover:shadow-glow transition-all">
            <div className="flex items-center justify-between mb-4">
               <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl grid place-items-center`}>
                 <i className={`fas ${stat.icon} text-lg`} />
               </div>
               <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${stat.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                  {stat.trend}
               </span>
            </div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stat.val}</div>
          </div>
        ))}
      </div>

      {/* Advanced Chart Area */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-soft mb-10">
        <h3 className="font-black text-xl text-slate-900 mb-8">Performance Analytics</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Verification Queue */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-soft overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-xl text-slate-900">Verification Queue</h3>
            <Link to="/admin/verifications" className="text-sm font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {[
              { name: "Tharindu Perera", type: "Individual", city: "Colombo", date: "2 mins ago" },
              { name: "Lanka Homes (Pvt) Ltd", type: "Business", city: "Kandy", date: "15 mins ago" },
              { name: "Kasun Jayasuriya", type: "Individual", city: "Galle", date: "1 hour ago" },
              { name: "Eco Cleaners", type: "Business", city: "Negombo", date: "3 hours ago" },
            ].map((req) => (
              <div key={req.name} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 grid place-items-center font-bold text-slate-500">
                    {req.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{req.name}</div>
                    <div className="text-xs text-slate-400 font-semibold">{req.type} · {req.city}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition grid place-items-center" title="Approve">
                    <i className="fas fa-check text-xs" />
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition grid place-items-center" title="Reject">
                    <i className="fas fa-xmark text-xs" />
                  </button>
                  <div className="w-px h-6 bg-slate-100 mx-1" />
                  <Link to="/admin/verifications" className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-slate-800 transition">Review</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-soft p-8">
          <h3 className="font-black text-xl text-slate-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[
              { icon: "fa-check", color: "text-emerald-500", text: "Order #4122 marked as completed.", time: "5m ago" },
              { icon: "fa-circle-exclamation", color: "text-rose-500", text: "New dispute raised by Buyer #882.", time: "12m ago" },
              { icon: "fa-user-plus", color: "text-blue-500", text: "New user registered as Buyer.", time: "45m ago" },
              { icon: "fa-star", color: "text-amber-500", text: "Seller 'Amila' reached Level 2.", time: "1h ago" },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className={`mt-1 ${activity.color}`}>
                  <i className={`fas ${activity.icon} text-sm`} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-700">{activity.text}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/admin/settings" className="w-full mt-10 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition flex items-center justify-center gap-2">
            <i className="fas fa-terminal text-xs" /> View System Logs
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
