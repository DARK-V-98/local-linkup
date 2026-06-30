import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import WhatsAppButton from "@/components/WhatsAppButton";
import { usePageTitle } from "@/lib/usePageTitle";
import { MOCK_CATEGORIES, MOCK_TOP_SERVICES, MOCK_LATEST_SERVICES } from "@/data/mock";
import { formatPrice, CATEGORY_GRADIENTS, SERVICE_GRADIENTS } from "@/lib/format";
import { getSaved, toggleSaved } from "@/lib/saved";
import { getUser } from "@/lib/auth";

const STATS = [
  { icon: "fa-users", label: "Active Sellers", value: "2,500+", tint: "bg-blue-500/10 text-blue-600" },
  { icon: "fa-circle-check", label: "Tasks Completed", value: "18,008+", tint: "bg-emerald-500/10 text-emerald-600" },
  { icon: "fa-table-cells-large", label: "Categories", value: "100+", tint: "bg-violet-500/10 text-violet-600" },
  { icon: "fa-star", label: "Average Rating", value: "4.9 / 5", tint: "bg-amber-500/10 text-amber-600" },
];

const STEPS = [
  { icon: "fa-magnifying-glass", title: "Search", body: "Tell us what you need or browse 100+ service categories." },
  { icon: "fa-comments", title: "Connect", body: "Compare verified pros, chat, and agree on the details." },
  { icon: "fa-handshake-angle", title: "Get it done", body: "Book securely, track progress, and pay only when happy." },
];

/* ── Service card ─────────────────────────────────────────────────────── */
function ServiceCard({
  s,
  index,
  saved,
  onSave,
}: {
  s: (typeof MOCK_TOP_SERVICES)[number];
  index: number;
  saved: boolean;
  onSave: (id: string, e: React.MouseEvent) => void;
}) {
  const grad = SERVICE_GRADIENTS[index % SERVICE_GRADIENTS.length];
  return (
    <Link
      to={`/service/${s.id}`}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-soft hover:-translate-y-0.5 transition-all"
    >
      <div className={`relative h-28 bg-gradient-to-br ${grad} grid place-items-center`}>
        <i className={`${s.categoryIcon} text-white/90 text-3xl`} />
        {s.badge && (
          <span className="absolute top-2.5 left-2.5 bg-white/95 text-slate-800 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <i className={`${s.badgeIcon} text-amber-500`} /> {s.badge}
          </span>
        )}
        <button
          onClick={(e) => onSave(s.id, e)}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 grid place-items-center text-sm shadow-sm hover:scale-110 transition"
          aria-label="Save"
        >
          <i className={`${saved ? "fas text-red-500" : "far text-slate-500"} fa-heart`} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary mb-1.5">
          <i className={s.categoryIcon} /> {s.category}
        </div>
        <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-primary transition min-h-[2.5rem]">
          {s.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 font-semibold">
          <span className="w-5 h-5 rounded-full bg-gradient-brand grid place-items-center text-white text-[9px] font-black">
            {s.sellerInitial}
          </span>
          {s.seller}
          <i className="fas fa-location-dot text-slate-300 ml-1" /> {s.location}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">From</div>
            <div className="text-sm font-black text-slate-900">{formatPrice(s.price)}</div>
          </div>
          <div className="flex items-center gap-1 text-xs font-black text-slate-700">
            <i className="fas fa-star text-amber-400" /> {s.rating.toFixed(1)}
            <span className="text-slate-400 font-semibold">({s.reviews})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Section heading ──────────────────────────────────────────────────── */
function SectionHead({ title, subtitle, to, cta }: { title: string; subtitle?: string; to?: string; cta?: string }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className="shrink-0 text-sm font-bold text-primary hover:underline flex items-center gap-1.5">
          {cta ?? "View all"} <i className="fas fa-arrow-right text-xs" />
        </Link>
      )}
    </div>
  );
}

export default function Index() {
  usePageTitle("Sri Lanka's Trusted Local Service Marketplace");
  const navigate = useNavigate();
  const user = getUser();
  const [query, setQuery] = useState("");
  const [savedSet, setSavedSet] = useState<Set<string>>(() => new Set(getSaved()));

  const handleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleSaved(id);
    setSavedSet((prev) => {
      const next = new Set(prev);
      if (nowSaved) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `/browse?q=${encodeURIComponent(query.trim())}` : "/browse");
  };

  return (
    <AppShell fullBleed>
      <div className="px-4 md:px-8 pt-6 space-y-8 max-w-[1400px]">
        {/* Hero / welcome panel */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 md:p-10">
          <div className="absolute inset-0 dot-pattern-light opacity-60" />
          <div className="absolute -right-16 -top-16 w-72 h-72 bg-gradient-brand rounded-full blur-3xl opacity-30" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-bold mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-glow animate-pulse" /> Sri Lanka's #1 service marketplace
            </span>
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
              {user ? `Welcome back, ${user.name.split(" ")[0]}.` : "Find trusted local pros,"}
              <br />
              <span className="text-gradient-brand">book in seconds.</span>
            </h1>
            <p className="text-slate-300 mt-3 text-sm md:text-base max-w-lg">
              Tech, home repairs, tuition, wellness and more — verified professionals across all 25 districts.
            </p>
            <form onSubmit={search} className="mt-6 flex flex-col sm:flex-row gap-2.5 max-w-xl">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 h-12">
                <i className="fas fa-magnifying-glass text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What service are you looking for?"
                  className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <button className="h-12 px-6 rounded-xl bg-gradient-brand font-bold text-primary-foreground shadow-glow shrink-0">
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Stats row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((st) => (
            <div key={st.label} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl grid place-items-center text-lg ${st.tint}`}>
                <i className={`fas ${st.icon}`} />
              </div>
              <div>
                <div className="text-xl font-black text-slate-900 leading-none">{st.value}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-1">{st.label}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Categories */}
        <section>
          <SectionHead title="Browse by category" subtitle="Pick a category to explore verified pros" to="/browse" cta="See all" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {MOCK_CATEGORIES.slice(0, 10).map((c, i) => (
              <Link
                key={c.id}
                to={`/browse?category=${encodeURIComponent(c.name)}`}
                className="group bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-soft hover:-translate-y-0.5 transition-all"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${
                    CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length]
                  } grid place-items-center text-white mb-3`}
                >
                  <i className={`${c.icon}`} />
                </div>
                <div className="font-black text-slate-900 text-sm leading-tight group-hover:text-primary transition">{c.name}</div>
                <div className="text-[11px] text-slate-400 font-semibold mt-0.5">{c.count} pros</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Top rated services */}
        <section>
          <SectionHead title="Top rated services" subtitle="Hand-picked sellers with the best reviews" to="/browse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_TOP_SERVICES.map((s, i) => (
              <ServiceCard key={s.id} s={s} index={i} saved={savedSet.has(s.id)} onSave={handleSave} />
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8">
          <SectionHead title="How Needlyy works" subtitle="Three simple steps from problem to solved" />
          <div className="grid md:grid-cols-3 gap-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl bg-slate-50 border border-slate-100 p-5">
                <span className="absolute top-4 right-4 text-4xl font-black text-slate-100">{i + 1}</span>
                <div className="w-12 h-12 rounded-2xl bg-gradient-brand grid place-items-center text-white text-lg shadow-glow mb-4">
                  <i className={`fas ${step.icon}`} />
                </div>
                <h3 className="font-black text-slate-900">{step.title}</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Latest services */}
        <section>
          <SectionHead title="Latest services" subtitle="Fresh listings from across the island" to="/browse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_LATEST_SERVICES.slice(0, 8).map((s, i) => (
              <ServiceCard key={s.id} s={s} index={i + 2} saved={savedSet.has(s.id)} onSave={handleSave} />
            ))}
          </div>
        </section>

        {/* Seller CTA */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary text-white p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute inset-0 dot-pattern-light opacity-40" />
          <div className="relative max-w-xl">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Have a skill? Start earning today.</h2>
            <p className="text-white/85 mt-2 text-sm md:text-base">
              Join 2,500+ sellers growing their business on Needlyy. List your service free in minutes.
            </p>
          </div>
          <Link
            to="/register/seller"
            className="relative shrink-0 bg-white text-slate-900 font-black px-7 py-3.5 rounded-xl shadow-lg hover:scale-105 transition flex items-center gap-2"
          >
            Become a Seller <i className="fas fa-arrow-right" />
          </Link>
        </section>
      </div>
      <WhatsAppButton />
    </AppShell>
  );
}
