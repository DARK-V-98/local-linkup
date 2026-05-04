import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/browse?q=${encodeURIComponent(q)}`);
  };

  return (
    <section className="relative pt-24 sm:pt-28 md:pt-36 pb-12 sm:pb-20 md:pb-32 overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 grid-overlay pointer-events-none" />
      {/* Morphing blobs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-primary/15 animate-morph blur-3xl" />
      <div className="absolute top-40 -right-24 w-96 h-96 bg-secondary/15 animate-morph blur-3xl" style={{ animationDelay: "-4s" }} />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-amber-300/20 animate-morph blur-3xl" style={{ animationDelay: "-8s" }} />

      <div className="container mx-auto relative grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-background/70 backdrop-blur border border-border rounded-full px-4 py-1.5 text-xs font-bold text-foreground/80 mb-6 shadow-glass">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Sri Lanka's #1 Service Marketplace
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1] md:leading-[0.95]">
            Find trusted <span className="text-gradient-brand">local pros</span>,<br className="hidden sm:block" />
            book in seconds.
          </h1>
          <p className="mt-5 text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
            From web developers to plumbers, tutors to wedding photographers — discover verified sellers across every category.
          </p>

          <form className="mt-8 max-w-2xl mx-auto lg:mx-0 bg-background/80 backdrop-blur-xl border border-border rounded-2xl p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-glass" onSubmit={handleSearch}>
            <div className="flex items-center gap-3 px-3 flex-1 min-w-0">
              <i className="fas fa-magnifying-glass text-muted-foreground" />
              <input
                value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="What service are you looking for?"
                className="bg-transparent outline-none flex-1 py-3 text-sm md:text-base placeholder:text-muted-foreground"
              />
            </div>
            <button className="bg-gradient-brand text-primary-foreground font-bold px-6 py-3 rounded-xl shadow-glow hover:scale-105 transition shrink-0">
              Search
            </button>
          </form>

          <div className="mt-7 flex flex-wrap justify-center lg:justify-start gap-2.5">
            {[
              ["fa-shield-halved", "Verified Sellers"],
              ["fa-lock", "Secure Payments"],
              ["fa-headset", "24/7 Support"],
            ].map(([icon, label]) => (
              <span key={label} className="inline-flex items-center gap-2 bg-background/70 backdrop-blur border border-border rounded-full px-3.5 py-1.5 text-xs font-semibold">
                <i className={`fas ${icon} text-primary`} /> {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right visual */}
        <div className="relative h-[420px] md:h-[520px] hidden lg:block">
          {/* Central hub */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative">
              <div className="absolute inset-0 -m-16 rounded-full border-2 border-dashed border-primary/30 animate-spin-slow" />
              <div className="absolute inset-0 -m-32 rounded-full border-2 border-dashed border-secondary/20 animate-spin-reverse" />
              <div className="relative w-40 h-40 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-gradient-brand grid place-items-center shadow-glow animate-morph">
                <i className="fas fa-handshake-angle text-6xl text-primary-foreground" />
              </div>
            </div>
          </div>

          {/* Floating stat cards */}
          {[
            { top: "5%", left: "0%", icon: "fa-star", color: "text-amber-500", label: "Avg Rating", value: "4.9", delay: "0s" },
            { top: "15%", right: "0%", icon: "fa-users", color: "text-secondary", label: "Active Sellers", value: "2,500+", delay: "-2s" },
            { bottom: "12%", left: "4%", icon: "fa-circle-check", color: "text-primary", label: "Tasks Done", value: "18,000+", delay: "-4s" },
            { bottom: "0%", right: "4%", icon: "fa-table-cells-large", color: "text-fuchsia-500", label: "Categories", value: "100+", delay: "-1s" },
          ].map((c, i) => (
            <div
              key={i}
              className="absolute bg-background/90 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-glass animate-float min-w-[150px]"
              style={{ top: c.top, left: c.left, right: c.right, bottom: c.bottom, animationDelay: c.delay }}
            >
              <div className="flex items-center gap-3">
                <span className={`grid place-items-center w-10 h-10 rounded-xl bg-foreground/5 ${c.color}`}>
                  <i className={`fas ${c.icon}`} />
                </span>
                <div>
                  <div className="text-xs text-muted-foreground font-semibold">{c.label}</div>
                  <div className="text-lg font-black">{c.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
