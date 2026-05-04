import DashboardShell from "@/components/dashboard/DashboardShell";
import { formatPrice } from "@/lib/format";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const buyerSidebarItems = [
  { label: "Overview", to: "/dashboard/buyer", icon: "fa-chart-pie" },
  { label: "My Bookings", to: "/dashboard/buyer/orders", icon: "fa-bag-shopping" },
  { label: "Wishlist", to: "/dashboard/buyer/saved", icon: "fa-heart" },
  { label: "Messages", to: "/dashboard/buyer/inbox", icon: "fa-comments" },
  { label: "Wallet", to: "/dashboard/buyer/payments", icon: "fa-credit-card" },
  { label: "Settings", to: "/dashboard/buyer/settings", icon: "fa-sliders" },
];

const spendingData = [
  { name: 'Creative', value: 45000, color: '#6366f1' },
  { name: 'Home Care', value: 15000, color: '#10b981' },
  { name: 'Learning', value: 8000, color: '#f59e0b' },
];

export default function BuyerDashboard() {
  return (
    <DashboardShell role="Premium Buyer" sidebarItems={buyerSidebarItems}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">
            Hello, <span className="text-primary">Saman.</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg">
            You have <span className="text-primary">2 active projects</span> in progress today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-black text-sm">
            Support Center
          </Button>
          <Button className="h-14 px-8 rounded-2xl bg-gradient-brand text-primary-foreground font-black text-sm shadow-glow hover:scale-105 transition-all">
            <i className="fas fa-search mr-2" /> Find New Pro
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Bookings */}
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-soft p-8 md:p-10 flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-black text-2xl text-slate-900">Current Progress</h3>
              <Button variant="ghost" className="font-black text-primary text-xs uppercase tracking-widest">
                Booking History
              </Button>
            </div>
            <div className="space-y-6">
               {[
                 { seller: "Yasiru F.", service: "Modern Branding & Identity Kit", status: "In Design Phase", deadline: "Oct 28", progress: 65, total: 35000, icon: "fa-palette" },
                 { seller: "Sunil B.", service: "Smart Home Plumbing Installation", status: "Awaiting Arrival", deadline: "Oct 25", progress: 15, total: 4000, icon: "fa-faucet-drip" },
               ].map((b, i) => (
                 <div key={i} className="p-7 border border-slate-100 rounded-[2.5rem] hover:shadow-glass hover:border-primary/20 transition-all duration-300 group cursor-pointer">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-[1.5rem] bg-slate-950 text-white grid place-items-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                             <i className={`fas ${b.icon} text-2xl`} />
                          </div>
                          <div>
                             <div className="font-black text-xl text-slate-900 group-hover:text-primary transition-colors leading-tight">{b.service}</div>
                             <div className="text-sm text-slate-400 font-bold mt-1">with {b.seller} · Expected {b.deadline}</div>
                          </div>
                       </div>
                       <div className="md:text-right min-w-[140px]">
                          <div className="font-[900] text-xl text-slate-900 mb-2">{formatPrice(b.total)}</div>
                          <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-wider mb-3">
                            {b.status}
                          </Badge>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-gradient-brand transition-all duration-1000" style={{ width: `${b.progress}%` }} />
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
             {[
               { label: "Saved Pros", icon: "fa-heart", to: "/dashboard/buyer/saved", color: "text-red-500", bg: "bg-red-50" },
               { label: "Post Request", icon: "fa-paper-plane", to: "/contact", color: "text-blue-500", bg: "bg-blue-50" },
               { label: "My Reviews", icon: "fa-star", to: "/dashboard/buyer/settings", color: "text-amber-500", bg: "bg-amber-50" },
             ].map((a) => (
               <button key={a.label} className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-soft hover:shadow-glass hover:-translate-y-1 transition-all duration-300 text-center group">
                  <div className={`w-14 h-14 ${a.bg} ${a.color} rounded-2xl grid place-items-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-soft`}>
                     <i className={`fas ${a.icon} text-xl`} />
                  </div>
                  <div className="text-sm font-black text-slate-700 uppercase tracking-wider">{a.label}</div>
               </button>
             ))}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-8">
           {/* Spending Breakdown */}
           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-soft p-8 md:p-10">
              <h3 className="font-black text-2xl text-slate-900 mb-8">Spending Analysis</h3>
              <div className="h-56 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={spendingData}
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                       >
                          {spendingData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Pie>
                       <Tooltip 
                          contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                       />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                    <span className="text-xl font-black text-slate-900">68K</span>
                 </div>
              </div>
              <div className="space-y-4 mt-8">
                 {spendingData.map((s) => (
                    <div key={s.name} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-sm font-bold text-slate-600">{s.name}</span>
                       </div>
                       <span className="text-sm font-black text-slate-900">{formatPrice(s.value)}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Wallet - Dark Mode Theme */}
           <div className="bg-slate-950 rounded-[3rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 blur-[80px] rounded-full -mr-10 -mt-10" />
              <div className="absolute inset-0 dot-pattern-light opacity-10" />
              <div className="relative z-10">
                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Available Balance</div>
                 <div className="text-4xl font-[900] text-gradient-brand tracking-tight mb-6">{formatPrice(12400)}</div>
                 <p className="text-sm text-slate-400 font-bold leading-relaxed mb-10">
                   Your funds are ready. Top up now to receive 5% cashback on your next premium booking.
                 </p>
                 <Button className="w-full h-14 bg-white text-slate-950 hover:bg-slate-200 rounded-2xl font-black text-sm shadow-glow transition-all">
                   Top up Wallet <i className="fas fa-plus-circle ml-2" />
                 </Button>
              </div>
           </div>

           {/* Quick Message */}
           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-soft p-8 md:p-10">
              <h3 className="font-black text-2xl text-slate-900 mb-8">Direct Chats</h3>
              <div className="space-y-6">
                 {[
                   { name: "Hashini W.", role: "Graphic Designer", status: "Online", initial: "H" },
                   { name: "Sunil B.", role: "Plumber", status: "Last seen 2h ago", initial: "S" },
                 ].map((s) => (
                   <div key={s.name} className="flex items-center justify-between group cursor-pointer p-2 rounded-2xl hover:bg-slate-50 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 grid place-items-center font-black text-slate-400 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                               {s.initial}
                            </div>
                            {s.status === "Online" && (
                              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white rounded-full" />
                            )}
                         </div>
                         <div>
                            <div className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{s.name}</div>
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{s.status}</div>
                         </div>
                      </div>
                      <i className="fas fa-chevron-right text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1" />
                   </div>
                 ))}
              </div>
              <Button variant="ghost" className="w-full mt-10 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 border border-slate-100 hover:bg-slate-50">
                All Conversations
              </Button>
           </div>
        </div>
      </div>
    </DashboardShell>
  );
}
