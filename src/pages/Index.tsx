import { useRef, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import WhatsAppButton from "@/components/WhatsAppButton";
import { usePageTitle } from "@/lib/usePageTitle";
import { SL_DISTRICTS, type ServiceListing } from "@/data/catalog";
import { useCategories } from "@/hooks/useCategories";
import { useServices } from "@/hooks/useServices";
import { usePlatformStats, useTopReviews } from "@/hooks/usePlatformStats";
import { formatPrice, timeAgo, SERVICE_GRADIENTS } from "@/lib/format";
import { getSaved, toggleSaved } from "@/lib/saved";
import { getUser } from "@/lib/auth";

/* ── Static content models (mirrors the approved dashboard mockup) ────── */

const HERO_FEATURES = ["Verified Professionals", "Secure Payments", "Money Back Guarantee", "25 Districts Covered"];

const POPULAR_TAGS = ["Web Development", "Photography", "Cleaning", "Electrician", "Home Tutor", "AI Development"];


const CATEGORY_TINTS = [
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-amber-50 text-amber-600",
  "bg-violet-50 text-violet-600",
  "bg-red-50 text-red-500",
  "bg-green-50 text-green-600",
  "bg-indigo-50 text-indigo-600",
  "bg-orange-50 text-orange-500",
  "bg-pink-50 text-pink-500",
  "bg-cyan-50 text-cyan-600",
];

const HOW_IT_WORKS = [
  { icon: "fa-magnifying-glass", title: "Search", body: "Tell us what you need" },
  { icon: "fa-users-viewfinder", title: "Compare", body: "Browse verified pros" },
  { icon: "fa-comments", title: "Chat", body: "Discuss & agree details" },
  { icon: "fa-calendar-check", title: "Book", body: "Schedule securely" },
  { icon: "fa-handshake-angle", title: "Get it done", body: "Track your job live" },
  { icon: "fa-star", title: "Review", body: "Rate your experience" },
];

const JOB_TINTS = [
  "bg-emerald-50 text-emerald-600",
  "bg-blue-50 text-blue-600",
  "bg-violet-50 text-violet-600",
  "bg-amber-50 text-amber-600",
];



/* ── Section heading ──────────────────────────────────────────────────── */

function SectionHead({ title, subtitle, to, cta }: { title: string; subtitle?: string; to?: string; cta?: string }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>
      {to && (
        <Link to={to} className="shrink-0 text-xs md:text-sm font-bold text-primary hover:underline flex items-center gap-1.5">
          {cta ?? "View all"} <i className="fas fa-arrow-right text-xs" />
        </Link>
      )}
    </div>
  );
}

/* ── Trending service card ────────────────────────────────────────────── */

function TrendingCard({
  s,
  index,
  saved,
  onSave,
}: {
  s: ServiceListing;
  index: number;
  saved: boolean;
  onSave: (id: string, e: React.MouseEvent) => void;
}) {
  const grad = SERVICE_GRADIENTS[index % SERVICE_GRADIENTS.length];
  return (
    <Link
      to={`/service/${s.id}`}
      className="group snap-start shrink-0 w-56 sm:w-64 bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-soft hover:-translate-y-0.5 transition-all"
    >
      <div className={`relative h-28 sm:h-32 bg-gradient-to-br ${grad} grid place-items-center`}>
        <i className={`${s.categoryIcon} text-white/90 text-3xl`} />
        <span className="absolute top-2.5 left-2.5 bg-amber-400 text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <i className="fas fa-fire" /> Trending
        </span>
        <button
          onClick={(e) => onSave(s.id, e)}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 grid place-items-center text-sm shadow-sm hover:scale-110 transition"
          aria-label="Save"
        >
          <i className={`${saved ? "fas text-red-500" : "far text-slate-500"} fa-heart`} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-primary transition">
          {s.title}
        </h3>
        <p className="text-[11px] text-slate-400 font-semibold mt-0.5 line-clamp-1">{s.category}</p>
        <div className="flex items-center gap-1 mt-2 text-xs font-black text-slate-700">
          <i className="fas fa-star text-amber-400" /> {s.rating.toFixed(1)}
          <span className="text-slate-400 font-semibold">({s.reviews})</span>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-100 text-sm font-black text-slate-900">
          <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">From</span>
          {formatPrice(s.price)}
        </div>
      </div>
    </Link>
  );
}

/* ── Right rail cards ─────────────────────────────────────────────────── */

function JoinSellerCard() {
  const [imgOk, setImgOk] = useState(true);

  // Preferred: the full card artwork provided by the design team
  if (imgOk) {
    return (
      <Link
        to="/register/seller"
        className="group block rounded-3xl overflow-hidden border border-slate-200 bg-white hover:shadow-soft hover:-translate-y-0.5 transition-all"
      >
        <img
          src="/images/join-seller.png"
          alt="Join as a Seller — free to join, get more clients, grow your business. Become a Seller."
          className="w-full h-auto"
          onError={() => setImgOk(false)}
        />
      </Link>
    );
  }

  // Fallback when the artwork file is missing
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 overflow-hidden">
      <h3 className="font-black text-slate-900">Join as a Seller</h3>
      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
        Start earning by offering your services to thousands of customers.
      </p>
      <ul className="space-y-2.5 mt-4">
        {["Free to join", "Get more clients", "Grow your business"].map((t) => (
          <li key={t} className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span className="w-[18px] h-[18px] rounded-full bg-emerald-100 text-emerald-600 grid place-items-center text-[9px]">
              <i className="fas fa-check" />
            </span>
            {t}
          </li>
        ))}
      </ul>
      <Link
        to="/register/seller"
        className="mt-4 flex items-center justify-center gap-2 bg-gradient-brand text-primary-foreground font-black text-sm py-3 rounded-xl shadow-glow hover:opacity-95 transition"
      >
        Become a Seller <i className="fas fa-arrow-right text-xs" />
      </Link>
    </div>
  );
}

function RecentJobsCard({ jobs }: { jobs: ServiceListing[] }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-slate-900 text-sm">Latest Listings</h3>
        <Link to="/browse" className="text-[11px] font-bold text-primary hover:underline">
          View all <i className="fas fa-arrow-right text-[9px]" />
        </Link>
      </div>
      <div className="space-y-3">
        {jobs.length === 0 && (
          <p className="text-[11px] text-slate-400 font-semibold py-2">No listings published yet.</p>
        )}
        {jobs.map((j, i) => (
          <div key={j.id} className="flex items-center gap-3">
            <span className={`w-9 h-9 rounded-xl grid place-items-center text-sm shrink-0 ${JOB_TINTS[i % JOB_TINTS.length]}`}>
              <i className={`fas ${j.categoryIcon}`} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-slate-900 truncate">{j.title}</div>
              <div className="text-[10px] text-slate-400 font-semibold">Listed {timeAgo(j.postedAt)}</div>
            </div>
            <div className="text-xs font-black text-slate-700 shrink-0">{formatPrice(j.price)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostJobCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 flex items-center gap-4">
      <div className="flex-1">
        <h3 className="font-black text-slate-900 text-sm">Need something specific?</h3>
        <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
          Post a job and let professionals bid for it.
        </p>
        <Link
          to="/post-request"
          className="mt-3 inline-flex items-center gap-2 bg-gradient-brand text-primary-foreground font-black text-xs px-4 py-2.5 rounded-xl shadow-glow"
        >
          Post a Job <i className="fas fa-pen-to-square text-[10px]" />
        </Link>
      </div>
      <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-500 grid place-items-center text-2xl shrink-0">
        <i className="fas fa-clipboard-list" />
      </div>
    </div>
  );
}

function PlatformStatsCard() {
  const { loading, sellerCount, serviceCount, categoryCount, districtCount, averageRating, reviewCount } = usePlatformStats();

  const items = [
    { icon: "fa-user-tie", value: sellerCount.toLocaleString(), label: "Professionals", tint: "bg-blue-50 text-blue-600" },
    { icon: "fa-briefcase", value: serviceCount.toLocaleString(), label: "Services Listed", tint: "bg-emerald-50 text-emerald-600" },
    { icon: "fa-table-cells-large", value: categoryCount.toLocaleString(), label: "Categories", tint: "bg-amber-50 text-amber-600" },
    { icon: "fa-location-dot", value: districtCount.toLocaleString(), label: "Districts", tint: "bg-violet-50 text-violet-600" },
    reviewCount > 0
      ? { icon: "fa-star", value: averageRating.toFixed(1), label: "Avg Rating", tint: "bg-sky-50 text-sky-600" }
      : { icon: "fa-star", value: "—", label: "Avg Rating", tint: "bg-sky-50 text-sky-600" },
    { icon: "fa-headset", value: "24/7", label: "Support", tint: "bg-rose-50 text-rose-500" },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5">
      <h3 className="font-black text-slate-900 text-sm mb-4">Platform Statistics</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5">
            <span className={`w-8 h-8 rounded-lg grid place-items-center text-xs shrink-0 ${s.tint}`}>
              <i className={`fas ${s.icon}`} />
            </span>
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 leading-none">{loading ? "—" : s.value}</div>
              <div className="text-[9px] text-slate-400 font-bold mt-0.5 truncate">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurePaymentsCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5">
      <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
        <i className="fas fa-lock text-emerald-500 text-xs" /> Secure Payments
      </h3>
      <p className="text-[11px] text-slate-500 font-medium mt-1">Your payments are safe with us.</p>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 grid place-items-center text-sm font-black italic text-blue-800 tracking-tight">VISA</span>
        <span className="h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center">
          <span className="w-4 h-4 rounded-full bg-red-500 inline-block" />
          <span className="w-4 h-4 rounded-full bg-amber-400 inline-block -ml-2" />
        </span>
        <span className="h-8 px-2.5 rounded-lg bg-blue-600 grid place-items-center text-[9px] font-black text-white tracking-widest">AMEX</span>
        <span className="h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 grid place-items-center text-xs font-black text-purple-600">eZ Cash</span>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function Index() {
  usePageTitle("Sri Lanka's Trusted Local Service Marketplace");
  const navigate = useNavigate();
  const { categories } = useCategories({ withCounts: true });
  const { services, loading: servicesLoading } = useServices();
  const stats = usePlatformStats();
  const { reviews: testimonials } = useTopReviews(3);

  // Headline counts, all derived from real listings — see usePlatformStats.
  const headlineStats = [
    { icon: "fa-user-tie", value: stats.sellerCount.toLocaleString(), label: "Verified Professionals", tint: "bg-blue-500/10 text-blue-600" },
    { icon: "fa-briefcase", value: stats.serviceCount.toLocaleString(), label: "Services Listed", tint: "bg-emerald-500/10 text-emerald-600" },
    { icon: "fa-table-cells-large", value: stats.categoryCount.toLocaleString(), label: "Categories", tint: "bg-violet-500/10 text-violet-600" },
    { icon: "fa-location-dot", value: stats.districtCount.toLocaleString(), label: "Districts Covered", tint: "bg-amber-500/10 text-amber-600" },
    { icon: "fa-headset", value: "24/7", label: "Support Available", tint: "bg-rose-500/10 text-rose-600" },
  ];
  const user = getUser();

  // Most-reviewed listings stand in for "trending" until view tracking lands.
  const trending = useMemo(
    () => [...services].sort((a, b) => b.reviews - a.reviews || b.rating - a.rating).slice(0, 6),
    [services]
  );

  // Newest listings, shown as the live activity ticker.
  const recentJobs = useMemo(
    () =>
      [...services]
        .sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime())
        .slice(0, 4),
    [services]
  );

  // One card per seller, ranked by how well reviewed their listings are.
  const professionals = useMemo(() => {
    const bySeller = new Map<string, (typeof services)[number]>();
    for (const s of services) {
      const key = s.sellerId ?? s.seller;
      const existing = bySeller.get(key);
      if (!existing || s.reviews > existing.reviews) bySeller.set(key, s);
    }
    return [...bySeller.values()]
      .sort((a, b) => b.reviews - a.reviews || b.rating - a.rating)
      .slice(0, 4);
  }, [services]);
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("All Districts");
  const [savedSet, setSavedSet] = useState<Set<string>>(() => new Set(getSaved()));
  const trendRef = useRef<HTMLDivElement>(null);

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
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (district !== "All Districts") params.set("district", district);
    navigate(params.toString() ? `/browse?${params.toString()}` : "/browse");
  };

  const scrollTrending = (dir: 1 | -1) => {
    trendRef.current?.scrollBy({ left: dir * 540, behavior: "smooth" });
  };

  return (
    <AppShell fullBleed>
      <div className="px-4 md:px-6 2xl:px-8 pt-6 mx-auto w-full max-w-[1800px] grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        {/* ══ Main column ══════════════════════════════════════════════ */}
        <div className="space-y-8 min-w-0">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white">
            <div className="absolute inset-0 dot-pattern-light opacity-60" />
            <div className="absolute -right-16 -top-16 w-72 h-72 bg-gradient-brand rounded-full blur-3xl opacity-25" />
            {/* Full-bleed hero artwork (user-provided) with a left gradient for text legibility */}
            <img
              src="/images/hero-professionals.png"
              alt=""
              aria-hidden
              className="hidden md:block absolute inset-0 w-full h-full object-cover object-right"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/85 to-slate-900/25" />
            <div className="relative p-6 md:p-9 lg:py-12">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-[11px] font-bold mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-glow animate-pulse" /> Sri Lanka's #1 Service Marketplace
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight">
                  {user ? `Welcome back, ${user.name.split(" ")[0]}.` : "Find trusted professionals"}
                  <br />
                  <span className="text-gradient-brand">{user ? "What do you need today?" : "across Sri Lanka"}</span>
                </h1>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                  {HERO_FEATURES.map((f) => (
                    <span key={f} className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-300">
                      <i className="fas fa-circle-check text-primary-glow" /> {f}
                    </span>
                  ))}
                </div>
                <form onSubmit={search} className="mt-6 flex flex-col sm:flex-row gap-2.5">
                  <div className="flex-1 flex items-center bg-white rounded-xl h-12 overflow-hidden">
                    <div className="flex-1 flex items-center gap-2 px-4 min-w-0">
                      <i className="fas fa-magnifying-glass text-slate-400" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="What service do you need?"
                        className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400 min-w-0"
                      />
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-200 px-3 h-full shrink-0">
                      <i className="fas fa-location-dot text-slate-400 text-xs" />
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-600 outline-none max-w-[110px]"
                        aria-label="District"
                      >
                        {SL_DISTRICTS.map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button className="h-12 px-7 rounded-xl bg-gradient-brand font-bold text-primary-foreground shadow-glow shrink-0">
                    Search
                  </button>
                </form>
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400">Popular:</span>
                  {POPULAR_TAGS.map((t) => (
                    <Link
                      key={t}
                      to={`/browse?q=${encodeURIComponent(t)}`}
                      className="text-[11px] font-bold bg-white/10 hover:bg-white/20 border border-white/10 rounded-full px-3 py-1 transition"
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Stats strip */}
          <section className="bg-white rounded-3xl border border-slate-200 px-5 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-5">
            {headlineStats.map((st) => (
              <div key={st.label} className="flex items-center gap-3">
                <span className={`w-10 h-10 rounded-xl grid place-items-center text-base shrink-0 ${st.tint}`}>
                  <i className={`fas ${st.icon}`} />
                </span>
                <div className="min-w-0">
                  <div className="text-base sm:text-lg font-black text-slate-900 leading-none">{stats.loading ? "—" : st.value}</div>
                  <div className="text-[10px] font-bold text-slate-400 mt-1 truncate">{st.label}</div>
                </div>
              </div>
            ))}
          </section>

          {/* Categories */}
          <section>
            <SectionHead title="Browse by Category" to="/browse" cta="View all categories" />
            <div className="flex gap-3 overflow-x-auto snap-x pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin">
              {categories.map((c, i) => (
                <Link
                  key={c.id}
                  to={`/browse?category=${encodeURIComponent(c.name)}`}
                  className="group snap-start shrink-0 w-[104px] bg-white rounded-2xl border border-slate-200 p-3 text-center hover:shadow-soft hover:-translate-y-0.5 transition-all"
                >
                  <div className={`w-12 h-12 mx-auto rounded-2xl grid place-items-center text-lg mb-2 ${CATEGORY_TINTS[i % CATEGORY_TINTS.length]}`}>
                    <i className={`fas ${c.icon}`} />
                  </div>
                  <div className="font-black text-slate-900 text-[11px] leading-tight group-hover:text-primary transition line-clamp-1">
                    {c.name}
                  </div>
                  <div className="text-[9px] text-slate-400 font-bold mt-0.5">{c.serviceCount ?? 0} services</div>
                </Link>
              ))}
              <Link
                to="/browse"
                className="group snap-start shrink-0 w-[104px] bg-white rounded-2xl border border-slate-200 p-3 text-center hover:shadow-soft hover:-translate-y-0.5 transition-all"
              >
                <div className="w-12 h-12 mx-auto rounded-2xl grid place-items-center text-lg mb-2 bg-slate-100 text-slate-500">
                  <i className="fas fa-table-cells-large" />
                </div>
                <div className="font-black text-slate-900 text-[11px] leading-tight group-hover:text-primary transition">More</div>
                <div className="text-[9px] text-slate-400 font-bold mt-0.5">See all</div>
              </Link>
            </div>
          </section>

          {/* Trending services */}
          <section>
            <div className="flex items-end justify-between gap-4 mb-4">
              <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Trending Services</h2>
              <div className="flex items-center gap-2">
                <Link to="/browse" className="text-xs md:text-sm font-bold text-primary hover:underline mr-1">
                  View all <i className="fas fa-arrow-right text-xs" />
                </Link>
                <button
                  onClick={() => scrollTrending(-1)}
                  className="hidden md:grid w-8 h-8 rounded-full bg-white border border-slate-200 place-items-center text-slate-500 hover:bg-slate-50 transition"
                  aria-label="Scroll left"
                >
                  <i className="fas fa-chevron-left text-xs" />
                </button>
                <button
                  onClick={() => scrollTrending(1)}
                  className="hidden md:grid w-8 h-8 rounded-full bg-white border border-slate-200 place-items-center text-slate-500 hover:bg-slate-50 transition"
                  aria-label="Scroll right"
                >
                  <i className="fas fa-chevron-right text-xs" />
                </button>
              </div>
            </div>
            <div ref={trendRef} className="flex gap-4 overflow-x-auto snap-x pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-thin">
              {servicesLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="shrink-0 w-56 sm:w-64 h-64 rounded-2xl bg-slate-100 animate-pulse" />
                  ))
                : trending.map((s, i) => (
                    <TrendingCard key={s.id} s={s} index={i} saved={savedSet.has(s.id)} onSave={handleSave} />
                  ))}
              {!servicesLoading && trending.length === 0 && (
                <p className="text-sm text-slate-400 font-semibold py-8">
                  No services published yet — listings appear here as sellers join.
                </p>
              )}
            </div>
          </section>

          {/* Top professionals — one card per seller, drawn from live listings */}
          {professionals.length > 0 && (
            <section>
              <SectionHead title="Top Professionals Near You" to="/browse" cta="View all professionals" />
              <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
                {professionals.map((p) => (
                  <div key={p.sellerId ?? p.seller} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-brand grid place-items-center text-white font-black text-lg">
                        {p.sellerInitial}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900 text-sm truncate">{p.seller}</span>
                        {p.sellerVerified && (
                          <i className="fas fa-circle-check text-emerald-500 text-xs shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold truncate">{p.category}</div>
                      <div className="flex items-center gap-1 text-[11px] font-black text-slate-700 mt-0.5">
                        {p.reviews > 0 ? (
                          <>
                            <i className="fas fa-star text-amber-400" /> {p.rating.toFixed(1)}
                            <span className="text-slate-400 font-semibold">({p.reviews})</span>
                            <span className="text-slate-300 mx-0.5">·</span>
                          </>
                        ) : (
                          <span className="text-slate-400 font-semibold">New seller ·</span>
                        )}
                        <span className="text-slate-400 font-semibold truncate">From {p.district}</span>
                      </div>
                    </div>
                    <Link
                      to={`/service/${p.id}`}
                      className="shrink-0 text-[11px] font-black text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground px-3.5 py-2 rounded-xl transition"
                    >
                      Hire Now
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* How it works */}
          <section className="bg-white rounded-3xl border border-slate-200 p-6 md:p-7">
            <SectionHead title="How It Works" subtitle="See how Needlyy works in 6 simple steps" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.title} className="text-center relative">
                  {i < HOW_IT_WORKS.length - 1 && (
                    <i className="hidden lg:block fas fa-arrow-right absolute top-5 -right-4 text-slate-200 text-sm" />
                  )}
                  <div className="w-11 h-11 mx-auto rounded-2xl bg-gradient-brand grid place-items-center text-white shadow-glow mb-2.5">
                    <i className={`fas ${step.icon} text-sm`} />
                  </div>
                  <div className="text-[9px] font-black text-slate-300 mb-0.5">STEP {i + 1}</div>
                  <div className="font-black text-slate-900 text-xs">{step.title}</div>
                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-snug">{step.body}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials — real reviews left by buyers */}
          {testimonials.length > 0 && (
          <section>
            <SectionHead title="What Our Customers Say" to="/feed" cta="View all reviews" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex gap-0.5 text-amber-400 text-xs mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i key={i} className={`fas fa-star ${i < t.rating ? "" : "text-slate-200"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-brand grid place-items-center text-white text-xs font-black">
                      {t.initial}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">{t.author}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{timeAgo(t.date)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          )}
        </div>

        {/* ══ Right rail (stacks below main content on <xl screens) ═════ */}
        <aside className="space-y-6 min-w-0 pb-4">
          <JoinSellerCard />
          <RecentJobsCard jobs={recentJobs} />
          <PostJobCard />
          <PlatformStatsCard />
          <SecurePaymentsCard />
        </aside>
      </div>
      <WhatsAppButton />
    </AppShell>
  );
}
