import { Link, useLocation } from "react-router-dom";

const items = [
  { to: "/", icon: "fa-house", label: "Home" },
  { to: "/feed", icon: "fa-bars-staggered", label: "Feed" },
];
const right = [
  { to: "/browse", icon: "fa-magnifying-glass", label: "Browse" },
  { to: "/login", icon: "fa-user", label: "Profile" },
];

export default function MobileNav() {
  const { pathname } = useLocation();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border">
      <div className="grid grid-cols-5 items-center h-16 px-2">
        {items.map((i) => (
          <Link key={i.label} to={i.to} className={`flex flex-col items-center gap-1 text-xs font-semibold ${pathname === i.to ? "text-primary" : "text-muted-foreground"}`}>
            <i className={`fas ${i.icon} text-base`} />
            {i.label}
          </Link>
        ))}
        <Link to="/role-selection?mode=register" className="-mt-8 mx-auto grid place-items-center w-14 h-14 rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow animate-pulse-glow">
          <i className="fas fa-plus text-xl" />
        </Link>
        {right.map((i) => (
          <Link key={i.label} to={i.to} className="flex flex-col items-center gap-1 text-xs font-semibold text-muted-foreground">
            <i className={`fas ${i.icon} text-base`} />
            {i.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
