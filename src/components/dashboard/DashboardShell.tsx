import { Link, useLocation, useNavigate } from "react-router-dom";
import { ReactNode, useState, useEffect, useRef } from "react";
import { getUser, clearUser } from "@/lib/auth";
import { getNotifications, AppNotification } from "@/components/NotificationsDropdown";

interface SidebarItem {
  label: string;
  to: string;
  icon: string;
}

const TYPE_ICON: Record<AppNotification["type"], { icon: string; color: string; bg: string }> = {
  booking_new: { icon: "fa-cart-shopping", color: "text-blue-600", bg: "bg-blue-50" },
  booking_confirmed: { icon: "fa-circle-check", color: "text-emerald-600", bg: "bg-emerald-50" },
  booking_completed: { icon: "fa-flag-checkered", color: "text-violet-600", bg: "bg-violet-50" },
  message: { icon: "fa-envelope", color: "text-sky-600", bg: "bg-sky-50" },
  review: { icon: "fa-star", color: "text-amber-500", bg: "bg-amber-50" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 3_600_000) return `${Math.max(1, Math.floor(diff / 60_000))} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hr ago`;
  if (diff < 172_800_000) return "Yesterday";
  return `${Math.floor(diff / 86_400_000)} days ago`;
}

export default function DashboardShell({
  children,
  role,
  sidebarItems,
}: {
  children: ReactNode;
  role: string;
  sidebarItems: SidebarItem[];
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState<AppNotification[]>(() => getNotifications());
  const location = useLocation();
  const navigate = useNavigate();
  const notifsRef = useRef<HTMLDivElement>(null);

  const user = getUser();
  const unread = notifs.filter((n) => !n.read).length;

  const handleSignOut = () => {
    clearUser();
    navigate("/");
  };

  const refreshNotifs = () => setNotifs(getNotifications());

  useEffect(() => {
    window.addEventListener("needly-notifications-change", refreshNotifs);
    return () => window.removeEventListener("needly-notifications-change", refreshNotifs);
  }, []);

  const markAllRead = () => {
    const all = getNotifications().map((n) => ({ ...n, read: true }));
    localStorage.setItem("needly_notifications", JSON.stringify(all));
    refreshNotifs();
  };

  const markRead = (id: string) => {
    const all = getNotifications().map((n) => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem("needly_notifications", JSON.stringify(all));
    refreshNotifs();
  };

  // Close notifs panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U";
  const userName = user?.name?.split(" ")[0] ?? role;

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
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-slate-900 text-slate-300 z-50 transition-transform duration-300 transform lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static lg:block`}
      >
        <div className="h-full flex flex-col p-6">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <img src="/logo.png" alt="Needlyy" className="h-10 w-auto brightness-0 invert" />
          </Link>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsSidebarOpen(false)}
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
            {/* User card */}
            <div className="bg-white/5 rounded-2xl p-4 mb-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-brand grid place-items-center text-primary-foreground font-black text-sm shadow-soft shrink-0">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{user?.name ?? "User"}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 truncate">{role}</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold hover:bg-red-500/10 hover:text-red-400 transition text-slate-400"
            >
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
            <input
              placeholder="Search dashboard..."
              className="bg-transparent border-none text-sm focus:ring-0 flex-1 outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative" ref={notifsRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative w-10 h-10 rounded-full bg-slate-50 border border-slate-200 grid place-items-center hover:bg-slate-100 transition"
              >
                <i className="fas fa-bell text-slate-600 text-sm" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[9px] font-black rounded-full grid place-items-center px-1 border-2 border-white">
                    {unread}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <span className="font-black text-slate-900 text-sm">Notifications</span>
                    {unread > 0 && (
                      <button onClick={markAllRead} className="text-[11px] font-bold text-primary hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifs.length === 0 ? (
                      <div className="px-4 py-8 text-center text-slate-400 text-xs font-semibold">
                        No notifications yet
                      </div>
                    ) : notifs.map((n) => {
                      const cfg = TYPE_ICON[n.type] ?? TYPE_ICON.message;
                      return (
                        <div
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition ${!n.read ? "bg-blue-50/40" : ""}`}
                        >
                          <span className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 mt-0.5 ${cfg.bg}`}>
                            <i className={`fas ${cfg.icon} text-sm ${cfg.color}`} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-xs font-black ${n.read ? "text-slate-700" : "text-slate-900"}`}>{n.title}</span>
                              {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                            <span className="text-[10px] text-slate-400 font-semibold mt-1 block">{timeAgo(n.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-4 py-3 border-t border-slate-100 text-center">
                    <button className="text-xs font-bold text-slate-400 hover:text-slate-600 transition">View all notifications</button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-10 w-px bg-slate-200 hidden sm:block" />

            {/* User pill */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-bold text-slate-900 leading-none">{userName}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{role}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-brand grid place-items-center text-white font-black shadow-soft text-sm">
                {userInitial}
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
