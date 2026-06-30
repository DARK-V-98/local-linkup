import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ReactNode, useEffect, useRef, useState } from "react";
import { getUser, clearUser, AuthUser } from "@/lib/auth";
import { getLang, setLang, LANG_LABELS, Lang } from "@/lib/lang";
import { getNotifications, AppNotification } from "@/components/NotificationsDropdown";
import MobileNav from "@/components/layout/MobileNav";

/* ── Sidebar navigation model ─────────────────────────────────────────── */

interface NavItem {
  to: string;
  label: string;
  icon: string;
  accent?: "danger";
}

const PRIMARY_NAV: NavItem[] = [
  { to: "/", label: "Home", icon: "fa-house" },
  { to: "/browse", label: "Browse", icon: "fa-compass" },
  { to: "/post-request", label: "Post a Job", icon: "fa-plus" },
  { to: "/overseas", label: "Overseas", icon: "fa-globe" },
  { to: "/feed", label: "Feed", icon: "fa-newspaper" },
];

const SECONDARY_NAV: NavItem[] = [
  { to: "/about", label: "About", icon: "fa-circle-info" },
  { to: "/contact", label: "Contact", icon: "fa-headset" },
  { to: "/emergency", label: "Emergency", icon: "fa-triangle-exclamation", accent: "danger" },
];

const ROLE_DASHBOARD: Record<string, string> = {
  buyer: "/dashboard/buyer",
  seller: "/dashboard/seller",
  admin: "/admin",
};

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

/* ── Sidebar nav link ─────────────────────────────────────────────────── */

function SidebarLink({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const { pathname } = useLocation();
  const isActive = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
  const danger = item.accent === "danger";
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-[15px] font-bold transition-all ${
        isActive
          ? danger
            ? "bg-red-500/15 text-red-400"
            : "bg-gradient-brand text-primary-foreground shadow-glow"
          : danger
            ? "text-red-300/80 hover:bg-red-500/10 hover:text-red-300"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <i className={`fas ${item.icon} w-5 text-center text-[15px]`} />
      {item.label}
    </Link>
  );
}

/* ── App Shell ────────────────────────────────────────────────────────── */

export default function AppShell({
  children,
  title,
  subtitle,
  actions,
  contentClassName = "",
  fullBleed = false,
}: {
  children: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  contentClassName?: string;
  fullBleed?: boolean;
}) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUserState] = useState<AuthUser | null>(() => getUser());
  const [lang, setLangState] = useState<Lang>(() => getLang());
  const [showLang, setShowLang] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifs, setNotifs] = useState<AppNotification[]>(() => getNotifications());
  const [query, setQuery] = useState("");

  const notifsRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unread = notifs.filter((n) => !n.read).length;
  const closeSidebar = () => setSidebarOpen(false);

  /* keep auth + notifications in sync */
  useEffect(() => {
    const syncAuth = () => setUserState(getUser());
    const syncNotifs = () => setNotifs(getNotifications());
    window.addEventListener("needly-auth-change", syncAuth);
    window.addEventListener("needly-notifications-change", syncNotifs);
    return () => {
      window.removeEventListener("needly-auth-change", syncAuth);
      window.removeEventListener("needly-notifications-change", syncNotifs);
    };
  }, []);

  /* outside-click for dropdowns */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setShowLang(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pickLang = (l: Lang) => {
    setLang(l);
    setLangState(l);
    setShowLang(false);
  };

  const markAllRead = () => {
    const all = getNotifications().map((n) => ({ ...n, read: true }));
    localStorage.setItem("needly_notifications", JSON.stringify(all));
    setNotifs(all);
  };

  const markRead = (id: string) => {
    const all = getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem("needly_notifications", JSON.stringify(all));
    setNotifs(all);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/browse?q=${encodeURIComponent(query.trim())}` : "/browse");
  };

  const handleSignOut = () => {
    clearUser();
    setShowUserMenu(false);
    navigate("/");
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() ?? "U";
  const dashboardLink = user ? ROLE_DASHBOARD[user.role] ?? "/" : "/login";

  /* ── Sidebar (shared markup, rendered twice: drawer + desktop) ──────── */
  const sidebar = (
    <div className="h-full flex flex-col p-5">
      <Link to="/" onClick={closeSidebar} className="flex items-center gap-2.5 mb-8 px-1">
        <span className="w-9 h-9 rounded-xl bg-gradient-brand grid place-items-center shadow-glow shrink-0 text-primary-foreground font-black text-lg">
          N
        </span>
        <span className="text-xl font-black text-white tracking-tight">Needlyy</span>
      </Link>

      <div className="px-2 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-600">Menu</div>
      <nav className="space-y-1">
        {PRIMARY_NAV.map((item) => (
          <SidebarLink key={item.to} item={item} onNavigate={closeSidebar} />
        ))}
      </nav>

      <div className="px-2 mt-6 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-600">Support</div>
      <nav className="space-y-1">
        {SECONDARY_NAV.map((item) => (
          <SidebarLink key={item.to} item={item} onNavigate={closeSidebar} />
        ))}
      </nav>

      <div className="mt-auto pt-6">
        {user ? (
          <div className="space-y-1">
            <Link
              to={dashboardLink}
              onClick={closeSidebar}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[15px] font-bold text-slate-400 hover:bg-white/5 hover:text-white transition"
            >
              <i className="fas fa-gauge-high w-5 text-center" />
              Dashboard
            </Link>
            <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-3 mt-2">
              <div className="w-9 h-9 rounded-full bg-gradient-brand grid place-items-center text-primary-foreground font-black text-sm shrink-0">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{user.name}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{user.role}</div>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="w-8 h-8 rounded-lg grid place-items-center text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition"
              >
                <i className="fas fa-right-from-bracket text-sm" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="text-sm font-black text-white mb-1">Join the marketplace</div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Book trusted local pros or start selling your services.
            </p>
            <Link
              to="/role-selection"
              onClick={closeSidebar}
              className="block text-center bg-gradient-brand text-primary-foreground font-bold text-sm py-2.5 rounded-xl shadow-glow mb-2"
            >
              Join Needlyy
            </Link>
            <Link
              to="/login"
              onClick={closeSidebar}
              className="block text-center text-slate-300 hover:text-white font-bold text-sm py-2 rounded-xl border border-white/10 hover:bg-white/5 transition"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 lg:hidden" onClick={closeSidebar} />
      )}

      {/* Drawer sidebar (mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-slate-900 z-50 transition-transform duration-300 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </aside>

      {/* Static sidebar (desktop) */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 shrink-0 sticky top-0 h-screen">
        {sidebar}
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center gap-3 px-4 md:px-6 sticky top-0 z-30">
          <button
            className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 grid place-items-center text-slate-700 shrink-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <i className="fas fa-bars" />
          </button>

          <form onSubmit={submitSearch} className="flex-1 max-w-md">
            <div className="flex items-center gap-2 px-4 h-10 bg-slate-100 border border-transparent focus-within:border-primary focus-within:bg-white rounded-full transition">
              <i className="fas fa-magnifying-glass text-slate-400 text-sm" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services, sellers…"
                className="bg-transparent border-none text-sm flex-1 outline-none placeholder:text-slate-400"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 ml-auto">
            {/* Language */}
            <div className="relative hidden sm:block" ref={langRef}>
              <button
                onClick={() => setShowLang((v) => !v)}
                className="h-10 px-3 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center text-sm font-bold text-slate-700 transition"
              >
                <span className="flex items-center gap-1.5">
                  <i className="fas fa-globe text-slate-400 text-xs" />
                  {LANG_LABELS[lang]}
                </span>
              </button>
              {showLang && (
                <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-50">
                  {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => pickLang(l)}
                      className={`block w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-50 ${
                        lang === l ? "text-primary" : "text-slate-700"
                      }`}
                    >
                      {LANG_LABELS[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifsRef}>
              <button
                onClick={() => setShowNotifs((v) => !v)}
                className="relative w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center transition"
                aria-label="Notifications"
              >
                <i className="fas fa-bell text-slate-600 text-sm" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[9px] font-black rounded-full grid place-items-center px-1 border-2 border-white">
                    {unread > 9 ? "9+" : unread}
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
                      <div className="px-4 py-8 text-center text-slate-400 text-xs font-semibold">No notifications yet</div>
                    ) : (
                      notifs.map((n) => {
                        const cfg = TYPE_ICON[n.type] ?? TYPE_ICON.message;
                        return (
                          <div
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition ${
                              !n.read ? "bg-blue-50/40" : ""
                            }`}
                          >
                            <span className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 mt-0.5 ${cfg.bg}`}>
                              <i className={`fas ${cfg.icon} text-sm ${cfg.color}`} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-xs font-black ${n.read ? "text-slate-700" : "text-slate-900"}`}>
                                  {n.title}
                                </span>
                                {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                              <span className="text-[10px] text-slate-400 font-semibold mt-1 block">{timeAgo(n.createdAt)}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Auth / user */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center gap-2 h-10 pl-1 pr-1 sm:pr-3 rounded-full bg-slate-100 hover:bg-slate-200 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-brand grid place-items-center text-white font-black text-sm">
                    {userInitial}
                  </div>
                  <span className="hidden sm:block text-sm font-bold text-slate-800 max-w-[90px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                  <i className="fas fa-chevron-down text-[10px] text-slate-400 hidden sm:block" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-50">
                    <Link
                      to={dashboardLink}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <i className="fas fa-gauge-high w-4 text-slate-400" /> Dashboard
                    </Link>
                    <Link
                      to="/dashboard/buyer/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <i className="fas fa-gear w-4 text-slate-400" /> Settings
                    </Link>
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <i className="fas fa-right-from-bracket w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:grid h-10 px-4 place-items-center rounded-full text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/role-selection"
                  className="h-10 px-4 grid place-items-center rounded-full bg-gradient-brand text-primary-foreground text-sm font-bold shadow-glow"
                >
                  Join
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Optional page header */}
        {(title || actions) && (
          <div className="flex items-start justify-between gap-4 px-4 md:px-8 pt-6 md:pt-8">
            <div>
              {title && <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{title}</h1>}
              {subtitle && <p className="text-sm text-slate-500 mt-1 font-medium">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          </div>
        )}

        {/* Content */}
        <main
          className={`flex-1 pb-24 lg:pb-10 animate-in fade-in slide-in-from-bottom-2 duration-500 ${
            fullBleed ? "" : "px-4 md:px-8 pt-6"
          } ${contentClassName}`}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom nav (mobile-first) */}
      <MobileNav />
    </div>
  );
}
