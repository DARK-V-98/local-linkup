import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { usePageTitle } from "@/lib/usePageTitle";

const QUICK_LINKS = [
  { label: "Home", to: "/", icon: "fa-house" },
  { label: "Browse", to: "/browse", icon: "fa-magnifying-glass" },
  { label: "Post a Job", to: "/post-request", icon: "fa-plus-circle" },
  { label: "Emergency", to: "/emergency", icon: "fa-bolt" },
  { label: "Feed", to: "/feed", icon: "fa-rss" },
  { label: "Contact", to: "/contact", icon: "fa-headset" },
];

export default function NotFound() {
  usePageTitle("Page Not Found");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 blur-3xl rounded-full animate-morph pointer-events-none" />
      <div
        className="absolute bottom-20 right-20 w-72 h-72 bg-secondary/10 blur-3xl rounded-full animate-morph pointer-events-none"
        style={{ animationDelay: "1.5s" }}
      />
      <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none" />

      <div className="relative max-w-lg mx-auto w-full">
        {/* Giant 404 with floating icon overlay */}
        <div className="relative flex items-center justify-center mb-6 select-none">
          <span className="text-[9rem] md:text-[12rem] font-black leading-none text-gradient-brand opacity-20">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-[2rem] bg-gradient-brand shadow-glow grid place-items-center animate-float">
              <i className="fas fa-map-signs text-primary-foreground text-4xl md:text-5xl" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">
          You've wandered off the map.
        </h1>
        <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-sm mx-auto leading-relaxed">
          The page you're looking for doesn't exist or may have been moved to a new location.
        </p>

        {/* Attempted path pill */}
        <div className="mt-5 inline-flex items-center gap-2 bg-foreground/5 border border-border rounded-full px-4 py-2 text-xs font-mono text-muted-foreground">
          <i className="fas fa-link text-muted-foreground/60" />
          {location.pathname}
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-background border border-border text-foreground font-bold hover:bg-foreground/5 shadow-soft transition"
          >
            <i className="fas fa-arrow-left" /> Go Back
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-brand text-primary-foreground font-bold shadow-glow hover:scale-105 transition"
          >
            <i className="fas fa-house" /> Go Home
          </Link>
        </div>

        {/* Quick links grid */}
        <div className="mt-10 bg-background/80 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-glass">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-5">
            You might be looking for
          </p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-foreground/5 transition group"
              >
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition">
                  <i className={`fas ${link.icon} text-sm`} />
                </span>
                <span className="text-xs font-bold text-foreground">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Support nudge */}
        <p className="mt-6 text-xs text-muted-foreground">
          Think this is a mistake?{" "}
          <Link to="/contact" className="text-primary font-bold hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
