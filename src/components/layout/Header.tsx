import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUser, clearUser, AuthUser } from "@/lib/auth";
import { getLang, setLang, LANG_LABELS, Lang } from "@/lib/lang";
import { toast } from "sonner";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Browse" },
  { to: "/overseas", label: "Overseas" },
  { to: "/feed", label: "Feed" },
  { to: "/about", label: "About" },
];

const ROLE_DASHBOARD: Record<string, string> = {
  buyer: "/dashboard/buyer",
  seller: "/dashboard/seller",
  admin: "/admin",
};

export default function Header() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [lang, setLangState] = useState<Lang>(getLang());
  const [showLang, setShowLang] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setUser(getUser());
    const onStorage = () => setUser(getUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleSignOut = () => {
    clearUser();
    setUser(null);
    toast.success("Signed out.");
    navigate("/");
    setOpen(false);
  };

  const switchLang = (l: Lang) => {
    setLang(l);
    setLangState(l);
    setShowLang(false);
  };

  const dashboardTo = user ? (ROLE_DASHBOARD[user.role] ?? "/dashboard/buyer") : "/login";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-soft" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img src="/logo.png" alt="Needlyy" className="h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-semibold transition ${isActive ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"}`
              }
              end={n.to === "/"}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {/* Language toggle */}
          <div className="relative">
            <button
              onClick={() => setShowLang(!showLang)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-border text-xs font-bold hover:bg-foreground/5 transition"
            >
              <i className="fas fa-globe text-primary text-[10px]" />
              {LANG_LABELS[lang]}
              <i className="fas fa-chevron-down text-[8px] text-muted-foreground" />
            </button>
            {showLang && (
              <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-2xl shadow-glass overflow-hidden z-50">
                {(["en", "si", "ta"] as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => switchLang(l)}
                    className={`w-full px-5 py-2.5 text-xs font-bold text-left hover:bg-foreground/5 transition whitespace-nowrap ${lang === l ? "text-primary" : "text-foreground"}`}
                  >
                    {l === "en" ? "🇬🇧 English" : l === "si" ? "🇱🇰 සිංහල" : "🇱🇰 தமிழ்"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Emergency */}
          <Link
            to="/emergency"
            className="inline-flex items-center gap-1.5 text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full text-xs font-bold transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Emergency
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to={dashboardTo} className="flex items-center gap-2.5 bg-foreground/5 hover:bg-foreground/10 px-3 py-2 rounded-full transition">
                <span className="grid place-items-center w-7 h-7 rounded-full bg-gradient-brand text-primary-foreground text-xs font-black">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="text-sm font-semibold max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${user.role === "admin" ? "bg-red-100 text-red-600" : user.role === "seller" ? "bg-violet-100 text-violet-600" : "bg-emerald-100 text-emerald-600"}`}>
                  {user.role}
                </span>
              </Link>
              <button onClick={handleSignOut} className="w-8 h-8 rounded-full border border-border grid place-items-center hover:bg-foreground/5 transition" title="Sign out">
                <i className="fas fa-right-from-bracket text-xs text-muted-foreground" />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-foreground hover:text-primary transition">
                Sign in
              </Link>
              <Link
                to="/role-selection?mode=register"
                className="inline-flex items-center gap-2 bg-gradient-brand text-primary-foreground px-5 py-2.5 rounded-full text-sm font-bold shadow-glow hover:scale-105 transition"
              >
                <i className="fas fa-rocket" /> Join Needlyy
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden grid place-items-center w-10 h-10 rounded-xl bg-foreground/5"
          aria-label="Toggle menu"
        >
          <i className={`fas ${open ? "fa-xmark" : "fa-bars"}`} />
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border">
          <div className="container mx-auto py-4 flex flex-col gap-1">
            {navItems.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-foreground/5 font-semibold">
                {n.label}
              </Link>
            ))}
            <Link to="/emergency" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl font-semibold text-red-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Emergency
            </Link>
            <div className="border-t border-border my-2" />
            {user ? (
              <>
                <Link to={dashboardTo} onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-foreground/5 font-semibold flex items-center gap-2">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-gradient-brand text-primary-foreground text-xs font-black">{user.name.charAt(0)}</span>
                  {user.name} ({user.role})
                </Link>
                <button onClick={handleSignOut} className="px-4 py-3 rounded-xl font-semibold text-red-500 text-left hover:bg-red-50 transition">
                  <i className="fas fa-right-from-bracket mr-2" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-foreground/5 font-semibold">Sign in</Link>
                <Link to="/role-selection?mode=register" onClick={() => setOpen(false)} className="mt-1 text-center bg-gradient-brand text-primary-foreground px-4 py-3 rounded-xl font-bold">
                  Join Needlyy
                </Link>
              </>
            )}
            {/* Language pills */}
            <div className="flex gap-2 px-4 py-2">
              {(["en", "si", "ta"] as Lang[]).map((l) => (
                <button key={l} onClick={() => switchLang(l)} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${lang === l ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
