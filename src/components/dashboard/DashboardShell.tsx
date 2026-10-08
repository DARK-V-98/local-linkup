import { Link, useLocation, useNavigate } from "react-router-dom";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Bell, Menu, X, Search, ArrowUpRight, LogOut, ChevronRight, Compass } from "lucide-react";
import { getUser, signOutFirebase } from "@/lib/auth";
import { getNotifications, type AppNotification } from "@/components/NotificationsDropdown";
import { WORKSPACE_NAV, type WorkspaceRole } from "./navigation";
import { toast } from "sonner";

export default function DashboardShell({ children }: { children: ReactNode; role?: string; sidebarItems?: { label: string; to: string; icon: string }[] }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const workspace: WorkspaceRole = pathname.startsWith("/admin") ? "admin" : pathname.startsWith("/dashboard/seller") ? "seller" : "buyer";
  const links = WORKSPACE_NAV[workspace];
  const user = getUser();
  const [drawer, setDrawer] = useState(false);
  const [query, setQuery] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState<AppNotification[]>(getNotifications);
  const notificationRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isActive = (to: string) => to === links[0].to ? pathname === to : pathname.startsWith(to);
  const page = links.find(l => isActive(l.to))?.label ?? "Workspace";
  const unread = notifs.filter(n => !n.read).length;
  useEffect(() => {
    const sync = () => setNotifs(getNotifications());
    const outside = (e: MouseEvent) => { if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) setShowNotifs(false); };
    window.addEventListener("needly-notifications-change", sync);
    document.addEventListener("mousedown", outside);
    return () => { window.removeEventListener("needly-notifications-change", sync); document.removeEventListener("mousedown", outside); };
  }, []);
  useEffect(() => {
    if (!drawer) return;
    closeRef.current?.focus();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") { setDrawer(false); menuRef.current?.focus(); } };
    document.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = old; document.removeEventListener("keydown", escape); };
  }, [drawer]);
  const markRead = (id?: string) => {
    const next = getNotifications().map(n => !id || n.id === id ? { ...n, read: true } : n);
    localStorage.setItem("needly_notifications", JSON.stringify(next));
    window.dispatchEvent(new Event("needly-notifications-change"));
  };
  const searchLinks = links.filter(l => l.label.toLowerCase().includes(query.toLowerCase()));
  const mobileLinks = workspace === "admin" ? links.filter(l => ["Overview", "Orders", "Verifications", "Reports"].includes(l.label)) : links.filter(l => ["Overview", workspace === "seller" ? "Orders" : "My bookings", "Messages", workspace === "seller" ? "My services" : "Saved services"].includes(l.label));
  return <div className="workspace-frame">
    {drawer && <button className="workspace-overlay" aria-label="Close menu" onClick={() => setDrawer(false)} />}
    <aside className={`workspace-sidebar ${drawer ? "is-open" : ""}`} aria-label="Workspace navigation">
      <div className="workspace-brand"><Link to="/"><span>N</span>Needlyy<span className="brand-dot">.</span></Link><button ref={closeRef} className="mobile-close" aria-label="Close menu" onClick={() => { setDrawer(false); menuRef.current?.focus(); }}><X size={20} /></button></div>
      <div className="workspace-type">{workspace === "admin" ? "ADMIN CONSOLE" : workspace === "seller" ? "SELLER STUDIO" : "YOUR PERSONAL SPACE"}</div>
      <nav className="workspace-links">{links.map((l, i) => <div key={l.to}>{(i === 0 || links[i - 1].group !== l.group) && <p className="nav-group">{l.group}</p>}<Link to={l.to} onClick={() => { setDrawer(false); setQuery(""); }} aria-current={isActive(l.to) ? "page" : undefined} className={isActive(l.to) ? "active" : ""}><l.Icon size={19} strokeWidth={1.7} /><span>{l.label}</span>{isActive(l.to) && <span className="nav-active-dot" />}</Link></div>)}</nav>
      <Link className="marketplace-return" to="/browse"><Compass size={18} />Explore marketplace<ArrowUpRight size={15} /></Link>
      <div className="workspace-account"><span className="account-avatar">{user?.name?.charAt(0) ?? "N"}</span><div><strong>{user?.name ?? "Your account"}</strong><span>{workspace === "admin" ? "Administrator" : workspace === "seller" ? "Seller account" : "Buyer account"}</span></div><button aria-label="Sign out" onClick={async () => { try { await signOutFirebase(); navigate("/login"); } catch { toast.error("Could not sign out. Please try again."); } }}><LogOut size={18} /></button></div>
    </aside>
    <div className="workspace-main">
      <header className="workspace-header"><button ref={menuRef} className="workspace-menu" aria-label="Open workspace menu" aria-expanded={drawer} onClick={() => setDrawer(true)}><Menu size={21} /></button><div className="workspace-breadcrumb"><span>{workspace === "admin" ? "Admin console" : workspace === "seller" ? "Seller studio" : "My workspace"}</span><ChevronRight size={13} /><strong>{page}</strong></div>
        <div className="workspace-search"><Search size={17} /><input aria-label="Find a dashboard page" placeholder="Find a page…" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if(e.key === "Escape") setQuery(""); if(e.key === "Enter" && searchLinks[0]) { navigate(searchLinks[0].to); setQuery(""); } }} />{query && <div className="workspace-search-results">{searchLinks.length ? searchLinks.map(l => <Link key={l.to} to={l.to} onClick={() => setQuery("")}><l.Icon size={16} />{l.label}<ChevronRight size={14} /></Link>) : <p>No matching pages</p>}</div>}</div>
        <div className="workspace-header-actions"><div ref={notificationRef} className="workspace-notifications"><button aria-label="Notifications" aria-expanded={showNotifs} onClick={() => setShowNotifs(v => !v)}><Bell size={19} />{unread > 0 && <span className="notification-dot" />}</button>{showNotifs && <div className="workspace-notification-panel"><div><strong>Notifications</strong>{unread > 0 && <button onClick={() => markRead()}>Mark all read</button>}</div>{notifs.length ? notifs.map(n => <button className={`notification-row ${n.read ? "" : "unread"}`} key={n.id} onClick={() => markRead(n.id)}><strong>{n.title}</strong><span>{n.body}</span></button>) : <p>You’re all caught up. Updates appear here.</p>}</div>}</div><Link to={links.find(l => l.label === "Settings")!.to} aria-label="Account settings" className="header-avatar">{user?.name?.charAt(0) ?? "N"}</Link></div>
      </header>
      <main className="workspace-content">{children}</main>
      <footer className="workspace-footer"><span>Needlyy · A little help goes a long way.</span><Link to="/contact">Need a hand? Contact support <ArrowUpRight size={13} /></Link></footer>
    </div>
    <nav className="workspace-mobile-nav" aria-label="Workspace tabs">{mobileLinks.map(l => <Link key={l.to} to={l.to} className={isActive(l.to) ? "active" : ""} aria-current={isActive(l.to) ? "page" : undefined}><l.Icon size={20} strokeWidth={1.8} /><span>{l.label === "My bookings" ? "Bookings" : l.label === "Saved services" ? "Saved" : l.label === "My services" ? "Services" : l.label}</span></Link>)}<button onClick={() => setDrawer(true)} aria-label="More workspace pages"><Menu size={20} /><span>More</span></button></nav>
  </div>;
}
