import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Plus, TriangleAlert, UserRound } from "lucide-react";
import { getUser } from "@/lib/auth";
export default function MobileNav() {
  const { pathname } = useLocation();
  const user = getUser();
  const profile = user ? ["admin", "developer"].includes(user.role) ? "/admin" : `/dashboard/${user.role}` : "/login";
  return <nav aria-label="Mobile navigation" className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-border" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
    <div className="grid grid-cols-5 items-center h-[72px] px-2">
      {[{to:"/", Icon:Home, label:"Home"}, {to:"/browse", Icon:Compass, label:"Explore"}, {to:"/post-request", Icon:Plus, label:"Request"}, {to:"/emergency", Icon:TriangleAlert, label:"Emergency"}, {to:profile, Icon:UserRound, label:"You"}].map(({to, Icon, label}) => {const active = to === "/" ? pathname === "/" : pathname.startsWith(to); return <Link key={label} to={to} aria-current={active ? "page" : undefined} className={`flex flex-col items-center justify-center gap-1.5 min-h-12 text-[10px] font-semibold ${active ? "text-primary" : "text-slate-500"}`}><span className={`grid place-items-center w-11 h-7 rounded-lg ${label === "Request" ? "bg-primary text-white" : active ? "bg-emerald-50" : ""}`}><Icon size={20} strokeWidth={1.8} /></span>{label}</Link>;})}
    </div>
  </nav>;
}
