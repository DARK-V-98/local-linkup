import { Link, useLocation } from "react-router-dom";
import { ReactNode, useState } from "react";

interface SidebarItem {
  label: string;
  to: string;
  icon: string;
}

interface SidebarProps {
  items: SidebarItem[];
  role: string;
}

export default function DashboardShell({ children, role, sidebarItems }: { children: ReactNode; role: string; sidebarItems: SidebarItem[] }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-900 text-slate-300 z-50 transition-transform duration-300 transform lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:static lg:block`}>
        <div className="h-full flex flex-col p-6">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <img src="/logo.png" alt="Needlyy" className="h-10 w-auto brightness-0 invert" />
          </Link>

          <nav className="flex-1 space-y-1">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    isActive 
                      ? "bg-gradient-brand text-primary-foreground shadow-glow" 
                      : "hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <i className={`fas ${item.icon} w-5 text-center`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <div className="bg-white/5 rounded-2xl p-4 mb-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Your Role</div>
              <div className="text-sm font-bold text-primary-glow flex items-center gap-2 mt-1">
                <i className="fas fa-shield-halved" /> {role}
              </div>
            </div>
            <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold hover:bg-red-500/10 hover:text-red-400 transition text-slate-400">
              <i className="fas fa-right-from-bracket w-5 text-center" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <button 
            className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 grid place-items-center"
            onClick={() => setIsSidebarOpen(true)}
          >
            <i className="fas fa-bars" />
          </button>

          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full min-w-[300px]">
            <i className="fas fa-magnifying-glass text-slate-400 text-sm" />
            <input placeholder="Search dashboard..." className="bg-transparent border-none text-sm focus:ring-0 flex-1" />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 rounded-full bg-slate-50 border border-slate-200 grid place-items-center hover:bg-slate-100 transition">
              <i className="fas fa-bell text-slate-600" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
            </button>
            <div className="h-10 w-px bg-slate-200 mx-1 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-bold text-slate-900 leading-none">Saman Perera</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{role}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-brand grid place-items-center text-white font-black shadow-soft">
                S
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
