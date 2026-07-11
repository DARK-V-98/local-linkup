import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { timeAgo } from "@/lib/format";

export interface AppNotification {
  id: string;
  type: "booking_new" | "booking_confirmed" | "booking_completed" | "message" | "review";
  title: string;
  body: string;
  link?: string;
  createdAt: string;
  read: boolean;
}

const NOTIF_KEY = "needly_notifications";

export function getNotifications(): AppNotification[] {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) ?? "[]"); } catch { return []; }
}

export function addNotification(n: Omit<AppNotification, "id" | "read" | "createdAt">) {
  const all = getNotifications();
  all.unshift({ ...n, id: Math.random().toString(36).slice(2), read: false, createdAt: new Date().toISOString() });
  localStorage.setItem(NOTIF_KEY, JSON.stringify(all.slice(0, 50)));
  window.dispatchEvent(new Event("needly-notifications-change"));
}

function markAllRead() {
  const all = getNotifications().map((n) => ({ ...n, read: true }));
  localStorage.setItem(NOTIF_KEY, JSON.stringify(all));
}

const NOTIF_ICONS: Record<AppNotification["type"], { icon: string; color: string }> = {
  booking_new: { icon: "fa-calendar-plus", color: "text-blue-500 bg-blue-50" },
  booking_confirmed: { icon: "fa-circle-check", color: "text-emerald-500 bg-emerald-50" },
  booking_completed: { icon: "fa-trophy", color: "text-amber-500 bg-amber-50" },
  message: { icon: "fa-comment", color: "text-violet-500 bg-violet-50" },
  review: { icon: "fa-star", color: "text-orange-500 bg-orange-50" },
};

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const refresh = () => setNotifs(getNotifications());

  useEffect(() => {
    refresh();
    window.addEventListener("needly-notifications-change", refresh);
    return () => window.removeEventListener("needly-notifications-change", refresh);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unread = notifs.filter((n) => !n.read).length;

  const handleOpen = () => {
    setOpen(!open);
  };

  const handleMarkAll = () => {
    markAllRead();
    refresh();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-xl bg-foreground/5 hover:bg-foreground/10 grid place-items-center transition"
        aria-label="Notifications"
      >
        <i className="fas fa-bell text-sm" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black grid place-items-center border-2 border-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-2xl shadow-glass overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <span className="font-bold text-sm">Notifications</span>
            {unread > 0 && (
              <button onClick={handleMarkAll} className="text-xs font-bold text-primary hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="text-center py-10">
                <i className="fas fa-bell-slash text-3xl text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : notifs.map((n) => {
              const meta = NOTIF_ICONS[n.type];
              const Wrapper = (n.link ? Link : "div") as React.ElementType;
              return (
                <Wrapper
                  key={n.id}
                  {...(n.link ? { to: n.link } : {})}
                  onClick={() => {
                    if (!n.read) {
                      const all = getNotifications().map((x) => x.id === n.id ? { ...x, read: true } : x);
                      localStorage.setItem(NOTIF_KEY, JSON.stringify(all));
                      refresh();
                    }
                    if (n.link) setOpen(false);
                  }}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-foreground/5 transition cursor-pointer border-b border-border/30 last:border-0 ${!n.read ? "bg-primary/[0.02]" : ""}`}
                >
                  <span className={`w-8 h-8 rounded-xl grid place-items-center shrink-0 mt-0.5 ${meta.color}`}>
                    <i className={`fas ${meta.icon} text-xs`} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-bold truncate ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(new Date(n.createdAt))}</p>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
