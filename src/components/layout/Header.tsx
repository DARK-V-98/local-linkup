import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/?browse=1", label: "Browse" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-soft" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 md:h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="grid place-items-center w-10 h-10 rounded-2xl bg-secondary text-secondary-foreground shadow-glass group-hover:scale-110 transition">
            <i className="fas fa-bolt text-lg" />
          </span>
          <span className="text-xl font-black tracking-tight">Needlyy</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-semibold transition ${
                  isActive ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                }`
              }
              end
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-foreground hover:text-primary transition">
            Sign in
          </Link>
          <Link
            to="/role-selection?mode=register"
            className="inline-flex items-center gap-2 bg-gradient-brand text-primary-foreground px-5 py-2.5 rounded-full text-sm font-bold shadow-glow hover:scale-105 transition"
          >
            <i className="fas fa-rocket" />
            Join Needlyy
          </Link>
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
            <Link to="/login" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-foreground/5 font-semibold">
              Sign in
            </Link>
            <Link
              to="/role-selection?mode=register"
              onClick={() => setOpen(false)}
              className="mt-2 text-center bg-gradient-brand text-primary-foreground px-4 py-3 rounded-xl font-bold"
            >
              Join Needlyy
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
