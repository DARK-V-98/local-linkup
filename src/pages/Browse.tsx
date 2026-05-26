import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { usePageTitle } from "@/lib/usePageTitle";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import { MOCK_CATEGORIES, MOCK_TOP_SERVICES, MOCK_LATEST_SERVICES, SL_DISTRICTS } from "@/data/mock";
import { formatPrice, timeAgo } from "@/lib/format";
import { getSaved, toggleSaved } from "@/lib/saved";

const allServices = [...MOCK_TOP_SERVICES, ...MOCK_LATEST_SERVICES];

const SERVICE_TYPES = ["All Types", "Fixed Price", "Hourly Service", "Booking Service", "Local Service", "Online Service"];
const SORT_OPTIONS = [
  { value: "relevant", label: "Most Relevant" },
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

export default function Browse() {
  usePageTitle("Browse Services");
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") ?? "all");
  const [district, setDistrict] = useState(searchParams.get("district") ?? "All Districts");
  const [serviceType, setServiceType] = useState("All Types");
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);
  const [sortBy, setSortBy] = useState("relevant");
  const [showFilters, setShowFilters] = useState(false);
  const [savedSet, setSavedSet] = useState<Set<string>>(() => new Set(getSaved()));

  const handleSave = (serviceId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaved(serviceId);
    setSavedSet(new Set(getSaved()));
  };

  useEffect(() => {
    const q = searchParams.get("q");
    const cat = searchParams.get("category");
    const dist = searchParams.get("district");
    if (q) setSearch(q);
    if (cat) setActiveCategory(cat);
    if (dist) setDistrict(dist);
  }, [searchParams]);

  const filtered = allServices
    .filter((s) => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.title.toLowerCase().includes(q) || s.seller.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || (s.tags ?? []).some((t) => t.toLowerCase().includes(q));
      const matchCat = activeCategory === "all" || s.category.toLowerCase().includes(activeCategory.toLowerCase());
      const matchDistrict = district === "All Districts" || s.district === district || (district === "Online" && s.district === "Online");
      const matchType = serviceType === "All Types" || s.type === serviceType;
      const matchRating = s.rating >= minRating;
      const matchPrice = s.price <= maxPrice;
      return matchSearch && matchCat && matchDistrict && matchType && matchRating && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return b.postedAt.getTime() - a.postedAt.getTime();
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return b.reviews - a.reviews;
    });

  const activeFilterCount = [
    district !== "All Districts",
    serviceType !== "All Types",
    minRating > 0,
    maxPrice < 200000,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero search bar */}
        <section className="bg-gradient-hero border-b border-border py-10 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />
          <div className="container mx-auto relative px-4">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              Explore <span className="text-gradient-brand">Services</span>
            </h1>
            <p className="mt-2 text-muted-foreground text-sm md:text-base">Find the right professional across Sri Lanka.</p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <i className="fas fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search services, skills, or sellers..."
                  className="w-full bg-background border border-border rounded-2xl pl-12 pr-5 py-4 shadow-glass focus:outline-none focus:ring-2 focus:ring-primary transition text-sm"
                />
              </div>

              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="bg-background border border-border rounded-2xl px-5 py-4 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-glass"
              >
                {SL_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm transition shadow-glass ${showFilters || activeFilterCount > 0 ? "bg-primary text-primary-foreground" : "bg-slate-900 text-white hover:bg-slate-800"}`}
              >
                <i className="fas fa-sliders text-sm" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-white text-primary text-xs font-black w-5 h-5 rounded-full grid place-items-center">{activeFilterCount}</span>
                )}
              </button>
            </div>

            {/* Expandable filters */}
            {showFilters && (
              <div className="mt-4 bg-background/95 backdrop-blur border border-border rounded-2xl p-5 grid sm:grid-cols-2 md:grid-cols-4 gap-5 shadow-glass">
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block">Service Type</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {SERVICE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block">
                    Minimum Rating: {minRating > 0 ? `${minRating}+` : "Any"}
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {[0, 3.5, 4, 4.5, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setMinRating(r)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${minRating === r ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary"}`}
                      >
                        {r === 0 ? "Any" : <><i className="fas fa-star text-amber-400" />{r}+</>}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block">
                    Max Price: {maxPrice >= 200000 ? "Any" : `Rs. ${maxPrice.toLocaleString()}`}
                  </label>
                  <input
                    type="range"
                    min={1000}
                    max={200000}
                    step={1000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Rs. 1,000</span>
                    <span>Rs. 200,000+</span>
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setDistrict("All Districts");
                      setServiceType("All Types");
                      setMinRating(0);
                      setMaxPrice(200000);
                    }}
                    className="w-full border border-border rounded-xl py-2.5 text-sm font-bold hover:bg-foreground/5 transition flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-rotate-left text-xs" /> Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="container mx-auto py-10 px-4 flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-7">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Categories</h3>
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition ${activeCategory === "all" ? "bg-primary/10 text-primary" : "hover:bg-foreground/5 text-muted-foreground"}`}
                >
                  All Services
                </button>
                {MOCK_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.name)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition flex items-center justify-between ${activeCategory === c.name ? "bg-primary/10 text-primary" : "hover:bg-foreground/5 text-muted-foreground"}`}
                  >
                    <span className="flex items-center gap-2">
                      <i className={`${c.icon} text-xs w-4`} />
                      {c.name}
                    </span>
                    <span className="text-[10px] opacity-60 bg-foreground/5 px-2 py-0.5 rounded-md">{c.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden">
              <div className="absolute inset-0 dot-pattern-light opacity-20" />
              <div className="relative">
                <i className="fas fa-rocket text-primary text-3xl mb-4" />
                <h4 className="font-bold text-base leading-tight">Ready to sell?</h4>
                <p className="text-xs text-slate-400 mt-2">Join thousands of pros and start earning today.</p>
                <Link to="/role-selection?mode=register" className="mt-5 block text-center w-full bg-gradient-brand text-primary-foreground py-3 rounded-xl font-bold text-xs">
                  Become a Seller
                </Link>
              </div>
            </div>

            {/* WhatsApp help */}
            <a
              href="https://wa.me/94771234567?text=Hi%20Needly!%20I%20need%20help%20finding%20a%20service."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl hover:bg-[#25D366]/20 transition"
            >
              <i className="fab fa-whatsapp text-2xl text-[#25D366]" />
              <div>
                <div className="font-bold text-sm">Need help finding?</div>
                <div className="text-xs text-muted-foreground">Chat with our team</div>
              </div>
            </a>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
              <div className="text-sm font-bold text-muted-foreground">
                <span className="text-foreground font-black">{filtered.length}</span> results
                {activeCategory !== "all" && <span> in <span className="text-primary">{activeCategory}</span></span>}
                {district !== "All Districts" && <span> · <span className="text-primary">{district}</span></span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground hidden sm:block">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((s) => (
                <Link
                  key={s.id}
                  to={`/service/${s.id}`}
                  className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-glass hover:-translate-y-1 transition-all"
                >
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100" />
                    <i className={`fas ${s.categoryIcon} text-slate-200 text-[8rem] absolute -bottom-6 -right-4 group-hover:scale-110 transition`} />
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 px-3 py-1 rounded-full text-[11px] font-bold text-foreground">
                      {s.category}
                    </div>
                    <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-foreground/30 backdrop-blur text-white px-2.5 py-1 rounded-full text-xs font-bold">
                      <i className="fas fa-star text-amber-300 text-[10px]" /> {s.rating}
                    </div>
                    {s.sellerVerified && (
                      <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-primary/90 text-white px-2.5 py-1 rounded-full text-[10px] font-bold">
                        <i className="fas fa-shield-halved text-[9px]" /> Verified
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-foreground line-clamp-2 leading-snug h-10 text-sm">{s.title}</h3>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="grid place-items-center w-7 h-7 rounded-full bg-gradient-brand text-primary-foreground text-xs font-black shrink-0">{s.sellerInitial}</span>
                      <span className="text-xs font-semibold text-muted-foreground truncate">{s.seller}</span>
                      <span className="ml-auto text-[10px] font-bold text-muted-foreground uppercase shrink-0">{s.district}</span>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                      <div>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase">From</div>
                        <div className="font-black text-foreground text-sm">{formatPrice(s.price)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleSave(s.id, e)}
                          className={`w-7 h-7 rounded-full grid place-items-center transition hover:scale-110 ${savedSet.has(s.id) ? "text-rose-500" : "text-slate-300 hover:text-rose-400"}`}
                          title={savedSet.has(s.id) ? "Remove from saved" : "Save seller"}
                        >
                          <i className={`${savedSet.has(s.id) ? "fas" : "far"} fa-heart text-sm`} />
                        </button>
                        <span className="text-xs text-muted-foreground font-semibold bg-foreground/5 px-2.5 py-1 rounded-full">{s.type}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-border">
                <i className="fas fa-magnifying-glass text-5xl text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-400">No results found</h3>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
                <button
                  onClick={() => {
                    setSearch(""); setActiveCategory("all"); setDistrict("All Districts");
                    setServiceType("All Types"); setMinRating(0); setMaxPrice(200000);
                  }}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  <i className="fas fa-rotate-left text-xs" /> Clear all filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <MobileNav />
      <WhatsAppButton />
    </div>
  );
}
