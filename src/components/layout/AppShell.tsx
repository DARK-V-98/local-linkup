import { Link, useLocation, useNavigate } from "react-router-dom";
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

const ROLE_QUICK_LINKS: Record<string, NavItem[]> = {
  buyer: [
    { to: "/dashboard/buyer", label: "Dashboard", icon: "fa-gauge-high" },
    { to: "/dashboard/buyer/orders", label: "My Bookings", icon: "fa-bag-shopping" },
    { to: "/dashboard/buyer/saved", label: "Saved", icon: "fa-heart" },
  ],
  seller: [
    { to: "/dashboard/seller", label: "Dashboard", icon: "fa-gauge-high" },
    { to: "/dashboard/seller/services", label: "My Services", icon: "fa-briefcase" },
    { to: "/dashboard/seller/inbox", label: "Inbox", icon: "fa-inbox" },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: "fa-gauge-high" },
    { to: "/admin/verifications", label: "Verifications", icon: "fa-user-check" },
    { to: "/admin/users", label: "Users", icon: "fa-users" },
  ],
};

const TYPE_ICON: Record<AppNotification["type"], { icon: string; color: string; bg: string }> = {
  booking_new: { icon: "fa-cart-shopping", color: "text-blue-600", bg: "bg-blue-50" },
  booking_confirmed: { icon: "fa-circle-check", color: "text-emerald-600", bg: "bg-emerald-50" },
  booking_completed: { icon: "fa-flag-checkered", color: "text-violet-600", bg: "bg-violet-50" },
  message: { icon: "fa-envelope", color: "text-sky-600", bg: "bg-sky-50" },
  review: { icon: "fa-star", color: "text-amber-500", bg: "bg-amber-50" },
};

const SIDEBAR_KEY = "needly_sidebar_collapsed";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 3_600_000) return `${Math.max(1, Math.floor(diff / 60_000))} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hr ago`;
  if (diff < 172_800_000) return "Yesterday";
  return `${Math.floor(diff / 86_400_000)} days ago`;
}

/* ── Sidebar nav link ─────────────────────────────────────────────────── */

function SidebarLink({
  item,
  onNavigate,
  collapsed,
}: {
  item: NavItem;
  onNavigate: () => void;
  collapsed?: boolean;
}) {
  const { pathname } = useLocation();
  const isActive = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
  const danger = item.accent === "danger";
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={`group flex items-center gap-3 ${collapsed ? "justify-center px-0" : "px-4"} py-2.5 rounded-xl text-[15px] font-bold transition-all ${
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
      {!collapsed && item.label}
    </Link>
  );
}

/* ── App Shell ────────────────────────────────────────────────────────── */

export default function AppShell({
  children,
  fullBleed = false,
  contentClassName = "",
}: {
  children: ReactNode;
  fullBleed?: boolean;
  contentClassName?: string;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => localStorage.getItem(SIDEBAR_KEY) === "1");
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

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      return next;
    });
  };

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
  const quickLinks = user ? ROLE_QUICK_LINKS[user.role] ?? [] : [];

  /* ── Sidebar (rendered twice: mobile drawer = expanded, desktop = collapsible) ── */
  const renderSidebar = (isCollapsed: boolean) => (
    <div className={`h-full flex flex-col ${isCollapsed ? "px-2.5 py-5" : "p-5"}`}>
      <Link
        to="/"
        onClick={closeSidebar}
        className={`flex items-center gap-2.5 mb-8 ${isCollapsed ? "justify-center" : "px-1"}`}
      >
        <span className="w-9 h-9 rounded-xl bg-gradient-brand grid place-items-center shadow-glow shrink-0 text-primary-foreground font-black text-lg">
          N
        </span>
        {!isCollapsed && <span className="text-xl font-black text-white tracking-tight">Needlyy</span>}
      </Link>

      <div className="flex-1 overflow-y-auto -mr-1 pr-1">
        {!isCollapsed && <div className="px-2 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-600">Menu</div>}
        <nav className="space-y-1">
          {PRIMARY_NAV.map((item) => (
            <SidebarLink key={item.to} item={item} onNavigate={closeSidebar} collapsed={isCollapsed} />
          ))}
        </nav>

        {quickLinks.length > 0 && (
          <>
            {!isCollapsed && (
              <div className="px-2 mt-6 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                My Workspace
              </div>
            )}
            {isCollapsed && <div className="my-3 mx-2 h-px bg-white/10" />}
            <nav className="space-y-1">
              {quickLinks.map((item) => (
                <SidebarLink key={item.to} item={item} onNavigate={closeSidebar} collapsed={isCollapsed} />
              ))}
            </nav>
          </>
        )}

        {!isCollapsed && <div className="px-2 mt-6 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-600">Support</div>}
        {isCollapsed && <div className="my-3 mx-2 h-px bg-white/10" />}
        <nav className="space-y-1">
          {SECONDARY_NAV.map((item) => (
            <SidebarLink key={item.to} item={item} onNavigate={closeSidebar} collapsed={isCollapsed} />
          ))}
        </nav>
      </div>

      <div className="pt-4 mt-2 border-t border-white/10">
        {user ? (
          isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Link
                to={dashboardLink}
                onClick={closeSidebar}
                title={user.name}
                className="w-10 h-10 rounded-full bg-gradient-brand grid place-items-center text-primary-foreground font-black text-sm"
              >
                {userInitial}
              </Link>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="w-9 h-9 rounded-lg grid place-items-center text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition"
              >
                <i className="fas fa-right-from-bracket text-sm" />
              </button>
            </div>
          ) : (
            <div className="bg-white/5 rounded-2xl p-3 flex items-center gap-3">
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
          )
        ) : isCollapsed ? (
          <Link
            to="/role-selection"
            onClick={closeSidebar}
            title="Join Needlyy"
            className="w-11 h-11 mx-auto rounded-xl bg-gradient-brand grid place-items-center text-primary-foreground shadow-glow"
          >
            <i className="fas fa-arrow-right-to-bracket" />
          </Link>
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

  const year = new Date().getFullYear();

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
        {renderSidebar(false)}
      </aside>

      {/* Static sidebar (desktop) */}
      <aside
        className={`hidden lg:block bg-slate-900 shrink-0 sticky top-0 h-screen transition-[width] duration-300 ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        {renderSidebar(collapsed)}
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

          {/* Desktop collapse toggle */}
          <button
            className="hidden lg:grid w-9 h-9 rounded-lg hover:bg-slate-100 place-items-center text-slate-500 shrink-0 transition"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <i className={`fas ${collapsed ? "fa-angles-right" : "fa-angles-left"} text-sm`} />
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
                      to={`/dashboard/${user.role === "seller" ? "seller" : "buyer"}/settings`}
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

        {/* Content */}
        <main
          className={`flex-1 pb-24 lg:pb-10 animate-in fade-in slide-in-from-bottom-2 duration-500 ${
            fullBleed ? "" : "px-4 md:px-8 pt-6"
          } ${contentClassName}`}
        >
          {children}
        </main>

        {/* In-app footer (desktop/tablet — mobile uses bottom nav) */}
        <footer className="hidden md:flex items-center justify-between gap-4 border-t border-slate-200 bg-white px-4 md:px-8 py-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <span className="w-6 h-6 rounded-md bg-gradient-brand grid place-items-center text-primary-foreground font-black text-[11px]">
              N
            </span>
            © {year} Needlyy — Sri Lanka's trusted service marketplace.
          </div>
          <nav className="flex items-center gap-5 text-xs font-bold text-slate-500">
            <Link to="/about" className="hover:text-primary transition">About</Link>
            <Link to="/contact" className="hover:text-primary transition">Contact</Link>
            <Link to="/terms" className="hover:text-primary transition">Terms</Link>
            <Link to="/privacy" className="hover:text-primary transition">Privacy</Link>
          </nav>
        </footer>
      </div>

      {/* Mobile bottom nav (mobile-first) */}
      <MobileNav />
    </div>
  );
}
