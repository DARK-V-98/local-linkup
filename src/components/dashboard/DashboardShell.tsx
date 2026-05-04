import { Link, useLocation } from "react-router-dom";
import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface SidebarItem {
  label: string;
  to: string;
  icon: string;
}

export default function DashboardShell({ children, role, sidebarItems }: { children: ReactNode; role: string; sidebarItems: SidebarItem[] }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-80 bg-slate-950 text-slate-300 z-[70] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:static lg:block border-r border-white/5 shadow-2xl`}>
        <div className="h-full flex flex-col p-8">
          <Link to="/" className="flex items-center gap-3 mb-12 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow group">
              <i className="fas fa-n text-white font-black group-hover:rotate-12 transition-transform" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">Needlyy</span>
          </Link>

          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 px-2">
            Main Navigation
          </div>

          <nav className="flex-1 space-y-2">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-sm transition-all duration-300 ${
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-glow scale-[1.02]" 
                      : "hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <i className={`fas ${item.icon} w-5 text-center text-base opacity-70`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-8">
            <div className="bg-white/5 rounded-3xl p-6 mb-6 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl rounded-full -mr-8 -mt-8" />
              <div className="relative z-10">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Access Level</div>
                <div className="flex items-center gap-2">
                   <Badge className="bg-primary/20 text-primary border-none font-black text-[10px] uppercase tracking-wider h-6">
                     <i className="fas fa-shield-check mr-1.5" /> {role}
                   </Badge>
                </div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-4 h-14 rounded-2xl font-black text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 px-5"
            >
              <i className="fas fa-right-from-bracket w-5 text-center text-base" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden w-12 h-12 rounded-2xl bg-slate-100 grid place-items-center hover:bg-slate-200 transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <i className="fas fa-bars" />
            </button>
            
            <div className="hidden md:flex items-center gap-3 px-5 h-12 bg-slate-50 border border-slate-200 rounded-2xl min-w-[320px] group focus-within:border-primary/50 focus-within:bg-white transition-all">
              <i className="fas fa-magnifying-glass text-slate-400 text-sm group-focus-within:text-primary transition-colors" />
              <input 
                placeholder="Search analytics, orders..." 
                className="bg-transparent border-none text-sm font-bold focus:ring-0 flex-1 placeholder:text-slate-400" 
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <Button variant="ghost" size="icon" className="relative w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all">
                 <i className="fas fa-bell text-slate-600" />
                 <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
               </Button>
               <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all hidden sm:flex">
                 <i className="fas fa-cog text-slate-600" />
               </Button>
            </div>

            <div className="h-10 w-px bg-slate-200 mx-1" />
            
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-black text-slate-900 leading-none mb-1 group-hover:text-primary transition-colors">Saman Perera</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{role}</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white font-black shadow-soft grid place-items-center text-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">S</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] custom-scrollbar">
          <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
