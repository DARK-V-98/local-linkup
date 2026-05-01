import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MOCK_CATEGORIES, MOCK_TOP_SERVICES, MOCK_LATEST_SERVICES } from "@/data/mock";
import { formatPrice, timeAgo } from "@/lib/format";
import { useState } from "react";

const allServices = [...MOCK_TOP_SERVICES, ...MOCK_LATEST_SERVICES];

export default function Browse() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = allServices.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.seller.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || s.category.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <section className="bg-gradient-hero border-b border-border py-12 md:py-20 relative overflow-hidden">
           <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />
           <div className="container mx-auto relative px-4">
             <h1 className="text-4xl md:text-5xl font-black tracking-tight">Explore <span className="text-gradient-brand">Services</span></h1>
             <p className="mt-3 text-muted-foreground">Find the perfect professional for your project.</p>

             <div className="mt-10 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                   <i className="fas fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                   <input
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     placeholder="Search for services, skills or sellers..."
                     className="w-full bg-background border border-border rounded-2xl pl-12 pr-6 py-4 shadow-glass focus:outline-none focus:ring-2 focus:ring-primary transition"
                   />
                </div>
                <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition">
                   <i className="fas fa-sliders text-sm" /> Filters
                </button>
             </div>
           </div>
        </section>

        <section className="container mx-auto py-12 px-4 flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-8">
            <div>
               <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Categories</h3>
               <div className="space-y-1">
                 <button
                   onClick={() => setActiveCategory("all")}
                   className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold transition ${activeCategory === "all" ? "bg-primary/10 text-primary" : "hover:bg-foreground/5 text-muted-foreground"}`}
                 >
                   All Services
                 </button>
                 {MOCK_CATEGORIES.map(c => (
                   <button
                     key={c.id}
                     onClick={() => setActiveCategory(c.name)}
                     className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold transition flex items-center justify-between ${activeCategory === c.name ? "bg-primary/10 text-primary" : "hover:bg-foreground/5 text-muted-foreground"}`}
                   >
                     {c.name} <span className="text-[10px] opacity-60 bg-foreground/5 px-2 py-0.5 rounded-md">{c.count}</span>
                   </button>
                 ))}
               </div>
            </div>

            <div className="p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden">
               <div className="absolute inset-0 dot-pattern-light opacity-20" />
               <div className="relative">
                 <i className="fas fa-rocket text-primary-glow text-3xl mb-4" />
                 <h4 className="font-bold text-lg leading-tight">Ready to sell?</h4>
                 <p className="text-xs text-slate-400 mt-2">Join thousands of pros and start earning today.</p>
                 <button className="w-full mt-5 bg-gradient-brand text-primary-foreground py-3 rounded-xl font-bold text-xs">Become a Seller</button>
               </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
             <div className="flex items-center justify-between mb-8">
                <div className="text-sm font-bold text-muted-foreground">
                   Showing {filtered.length} results
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-xs font-bold text-muted-foreground">Sort by:</span>
                   <select className="bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer">
                      <option>Most Relevant</option>
                      <option>Newest First</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                   </select>
                </div>
             </div>

             <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((s) => (
                  <article key={s.id} className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-glass hover:-translate-y-1 transition-all">
                    <div className="relative h-40 bg-slate-100 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100" />
                      <i className={`fas ${s.categoryIcon} text-slate-300 text-[8rem] absolute -bottom-6 -right-4 group-hover:scale-110 transition`} />
                      <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 px-3 py-1 rounded-full text-[11px] font-bold text-foreground">
                        {s.category}
                      </div>
                      <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-foreground/30 backdrop-blur text-white px-2.5 py-1 rounded-full text-xs font-bold">
                        <i className="fas fa-star text-amber-300 text-[10px]" /> {s.rating}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-foreground mt-1 line-clamp-2 leading-snug h-10">{s.title}</h3>
                      <div className="flex items-center gap-2 mt-4">
                        <span className="grid place-items-center w-7 h-7 rounded-full bg-gradient-brand text-primary-foreground text-xs font-black">{s.sellerInitial}</span>
                        <span className="text-xs font-semibold text-muted-foreground">{s.seller}</span>
                        <span className="ml-auto text-[10px] font-bold text-muted-foreground uppercase">{s.location}</span>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <div>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase">Starting at</div>
                          <div className="font-black text-foreground">{formatPrice(s.price)}</div>
                        </div>
                        <button className="grid place-items-center w-9 h-9 rounded-xl bg-foreground/5 group-hover:bg-gradient-brand group-hover:text-primary-foreground transition">
                          <i className="fas fa-arrow-right text-sm" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
             </div>

             {filtered.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-border">
                   <i className="fas fa-search text-5xl text-slate-200 mb-4" />
                   <h3 className="text-xl font-bold text-slate-400">No results found</h3>
                   <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
                </div>
             )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
