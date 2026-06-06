import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getNotifications } from "@/components/NotificationsDropdown";

export default function MobileNav() {
  const { pathname } = useLocation();
  const [unread, setUnread] = useState(0);

  const refreshUnread = () => {
    const notifs = getNotifications();
    setUnread(notifs.filter((n) => !n.read).length);
  };

  useEffect(() => {
    refreshUnread();
    window.addEventListener("needly-notifications-change", refreshUnread);
    return () => window.removeEventListener("needly-notifications-change", refreshUnread);
  }, []);

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border">
      <div className="grid grid-cols-5 items-center h-16 px-2">
        {[
          { to: "/", icon: "fa-house", label: "Home" },
          { to: "/browse", icon: "fa-magnifying-glass", label: "Browse" },
        ].map((i) => (
          <Link key={i.label} to={i.to} className={`flex flex-col items-center gap-1 text-xs font-semibold ${pathname === i.to ? "text-primary" : "text-muted-foreground"}`}>
            <i className={`fas ${i.icon} text-base`} />
            {i.label}
          </Link>
        ))}

        <Link to="/post-request" className="-mt-8 mx-auto grid place-items-center w-14 h-14 rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
          <i className="fas fa-plus text-xl" />
        </Link>

        <Link to="/emergency" className="flex flex-col items-center gap-1 text-xs font-semibold text-red-500">
          <i className="fas fa-triangle-exclamation text-base" />
          Emergency
        </Link>

        <Link to="/login" className={`relative flex flex-col items-center gap-1 text-xs font-semibold ${pathname === "/login" ? "text-primary" : "text-muted-foreground"}`}>
          <span className="relative">
            <i className="fas fa-user text-base" />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </span>
          Profile
        </Link>
      </div>
    </nav>
  );
}
