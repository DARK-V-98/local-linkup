import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    try {
      const existing: string[] = JSON.parse(localStorage.getItem("needly_newsletter") ?? "[]");
      if (!existing.includes(email.trim())) {
        existing.push(email.trim());
        localStorage.setItem("needly_newsletter", JSON.stringify(existing));
      }
    } catch { /* ignore */ }
    setSubscribed(true);
    toast.success("You're subscribed! Weekly deals & new sellers straight to your inbox.");
  };

  return (
    <footer className="relative bg-slate-900 text-slate-300 mt-16 md:mt-24">
      <div className="absolute inset-0 dot-pattern-light opacity-40 pointer-events-none" />

      {/* Newsletter strip */}
      <div className="relative border-b border-white/10">
        <div className="container mx-auto py-10 md:py-14 flex flex-col md:flex-row items-center gap-8 md:justify-between">
          <div className="text-center md:text-left shrink-0">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-brand grid place-items-center">
                <i className="fas fa-envelope text-primary-foreground text-xs" />
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-primary">Newsletter</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-white">Stay in the loop</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xs">
              New sellers, featured services and local deals delivered weekly.
            </p>
          </div>

          {!subscribed ? (
            <form
              onSubmit={handleSubscribe}
              className="flex items-stretch gap-2 w-full max-w-md"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-2xl px-5 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-0"
              />
              <button
                type="submit"
                className="bg-gradient-brand text-primary-foreground px-6 py-3 rounded-2xl font-bold text-sm shadow-glow hover:scale-105 transition shrink-0"
              >
                Subscribe
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-4 shrink-0">
              <i className="fas fa-circle-check text-emerald-400 text-xl" />
              <div>
                <div className="text-white font-bold text-sm">You're in!</div>
                <div className="text-slate-400 text-xs">Check your inbox for a welcome email.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main link grid */}
      <div className="container mx-auto relative py-12 md:py-16 grid grid-cols-2 md:grid-cols-6 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <img
              src="/logo.png"
              alt="Needlyy"
              className="h-12 md:h-14 w-auto object-contain brightness-0 invert"
            />
          </div>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            Sri Lanka's trusted marketplace connecting buyers with verified local pros across every category.
          </p>
          <div className="flex gap-3 mt-5">
            {[
              { icon: "facebook-f", label: "Facebook", href: "https://facebook.com" },
              { icon: "instagram", label: "Instagram", href: "https://instagram.com" },
              { icon: "x-twitter", label: "X / Twitter", href: "https://x.com" },
              { icon: "linkedin-in", label: "LinkedIn", href: "https://linkedin.com" },
            ].map((s) => (
              <a
                key={s.icon}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid place-items-center w-9 h-9 rounded-full bg-white/5 hover:bg-primary hover:text-primary-foreground transition"
              >
                <i className={`fab fa-${s.icon} text-sm`} />
              </a>
            ))}
          </div>
        </div>

        {[
          {
            title: "Marketplace",
            links: [
              ["Browse Services", "/browse"],
              ["Post a Job", "/post-request"],
              ["Emergency", "/emergency"],
              ["Service Feed", "/feed"],
              ["Buyer Dashboard", "/dashboard/buyer"],
            ],
          },
          {
            title: "For Sellers",
            links: [
              ["Become a Seller", "/role-selection?mode=register"],
              ["Seller Dashboard", "/dashboard/seller"],
              ["Create a Service", "/dashboard/seller/new-service"],
              ["Seller Inbox", "/dashboard/seller/inbox"],
              ["View Earnings", "/dashboard/seller/earnings"],
            ],
          },
          {
            title: "Company",
            links: [
              ["About Us", "/about"],
              ["Contact Us", "/contact"],
            ],
          },
          {
            title: "Legal",
            links: [
              ["Terms of Service", "/terms"],
              ["Privacy Policy", "/privacy"],
              ["Trust & Safety", "/about"],
            ],
          },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-white font-bold mb-4 text-sm">{col.title}</h4>
            <ul className="space-y-2.5 text-sm">
              {col.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="hover:text-primary transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/5">
        <div className="container mx-auto py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Needlyy. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <i className="fas fa-shield-halved text-primary" /> Verified & secure marketplace in 🇱🇰 Sri Lanka
          </span>
        </div>
      </div>
    </footer>
  );
}
