import DashboardShell from "@/components/dashboard/DashboardShell";
import { formatPrice } from "@/lib/format";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const buyerSidebarItems = [
  { label: "Overview", to: "/dashboard/buyer", icon: "fa-house-user" },
  { label: "My Orders", to: "/dashboard/buyer/orders", icon: "fa-bag-shopping" },
  { label: "Saved Items", to: "/dashboard/buyer/saved", icon: "fa-heart" },
  { label: "Chat Inbox", to: "/dashboard/buyer/inbox", icon: "fa-comments" },
  { label: "Payment Methods", to: "/dashboard/buyer/payments", icon: "fa-credit-card" },
  { label: "Account Settings", to: "/dashboard/buyer/settings", icon: "fa-user-gear" },
];

const spendingData = [
  { name: 'Technology', value: 45000, color: '#6366f1' },
  { name: 'Home Services', value: 15000, color: '#10b981' },
  { name: 'Education', value: 8000, color: '#f59e0b' },
];

export default function BuyerDashboard() {
  return (
    <DashboardShell role="Premium Buyer" sidebarItems={buyerSidebarItems}>
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Buyer Dashboard</h1>
        <p className="text-slate-500 font-medium">Manage your orders and stay in touch with your pros.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Bookings */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-soft p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-xl text-slate-900">Active Bookings</h3>
              <button className="text-sm font-bold text-primary hover:underline">See History</button>
            </div>
            <div className="space-y-4">
               {[
                 { seller: "Yasiru F.", service: "React & Next.js Website Development", status: "In Progress", deadline: "Oct 28", progress: 65, total: 35000 },
                 { seller: "Sunil B.", service: "Full House Plumbing Maintenance", status: "Pending Visit", deadline: "Oct 25", progress: 10, total: 4000 },
               ].map((b, i) => (
                 <div key={i} className="p-6 border border-slate-100 rounded-2xl hover:border-primary/20 transition group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white grid place-items-center">
                             <i className="fas fa-hammer" />
                          </div>
                          <div>
                             <div className="font-bold text-slate-900 group-hover:text-primary transition">{b.service}</div>
                             <div className="text-xs text-slate-400 font-semibold">with {b.seller} · Expected {b.deadline}</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="font-black text-slate-900 mb-1">{formatPrice(b.total)}</div>
                          <div className="text-[10px] font-black uppercase text-primary mb-1">{b.status}</div>
                          <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${b.progress}%` }} />
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-3 gap-4">
             {[
               { label: "Find new Pro", icon: "fa-magnifying-glass", to: "/browse", color: "text-blue-500", bg: "bg-blue-50" },
               { label: "Contact Support", icon: "fa-headset", to: "/contact", color: "text-emerald-500", bg: "bg-emerald-50" },
               { label: "Post a Request", icon: "fa-bullhorn", to: "/contact", color: "text-amber-500", bg: "bg-amber-50" },
             ].map((a) => (
               <button key={a.label} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-soft hover:shadow-glow transition text-center group">
                  <div className={`w-12 h-12 ${a.bg} ${a.color} rounded-2xl grid place-items-center mx-auto mb-3 group-hover:scale-110 transition`}>
                     <i className={`fas ${a.icon}`} />
                  </div>
                  <div className="text-sm font-bold text-slate-700">{a.label}</div>
               </button>
             ))}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
           {/* Spending Breakdown */}
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-soft p-8">
              <h3 className="font-black text-xl text-slate-900 mb-6">Spending</h3>
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
           </div>

           {/* Wallet */}
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 dot-pattern-light opacity-20" />
              <div className="relative">
                 <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Needlyy Wallet</div>
                 <div className="text-3xl font-black">{formatPrice(12400)}</div>
                 <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">Available for your next booking. Top up to get 5% cashback on local services.</p>
                 <button className="w-full mt-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm shadow-glow">Top up Wallet</button>
              </div>
           </div>

           {/* Saved Sellers */}
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-soft p-8">
              <h3 className="font-black text-xl text-slate-900 mb-6">Saved Sellers</h3>
              <div className="space-y-4">
                 {[
                   { name: "Hashini W.", role: "Graphic Designer", rating: 5.0 },
                   { name: "Ravi M.", role: "AC Technician", rating: 4.8 },
                 ].map((s) => (
                   <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-100 grid place-items-center font-bold text-slate-500">{s.name[0]}</div>
                         <div>
                            <div className="text-sm font-bold text-slate-900">{s.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase">{s.role}</div>
                         </div>
                      </div>
                      <div className="text-amber-500 text-xs font-bold"><i className="fas fa-star" /> {s.rating}</div>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-8 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition">View All Saved</button>
           </div>
        </div>
      </div>
    </DashboardShell>
  );
}
