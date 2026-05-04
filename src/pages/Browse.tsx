import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MOCK_CATEGORIES, MOCK_TOP_SERVICES, MOCK_LATEST_SERVICES } from "@/data/mock";
import { formatPrice, timeAgo } from "@/lib/format";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

const allServices = [...MOCK_TOP_SERVICES, ...MOCK_LATEST_SERVICES];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "all");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState("relevant");

  useEffect(() => {
    const q = searchParams.get("q");
    const cat = searchParams.get("category");
    if (q) setSearch(q);
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = allServices.filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                           s.seller.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "all" || 
                             s.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesPrice = s.price >= priceRange[0] && s.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    
    return result;
  }, [search, activeCategory, priceRange, sortBy]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === "all") newParams.delete("category");
    else newParams.set("category", cat);
    setSearchParams(newParams);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    const newParams = new URLSearchParams(searchParams);
    if (!val) newParams.delete("q");
    else newParams.set("q", val);
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="pt-20">
        <section className="bg-slate-950 text-white border-b border-white/5 py-16 md:py-24 relative overflow-hidden">
           <div className="absolute inset-0 dot-pattern-light opacity-10 pointer-events-none" />
           <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full -mr-32 -mt-32" />
           
           <div className="container mx-auto relative px-4 text-center">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest mb-6 text-primary">
               Service Marketplace
             </div>
             <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6">
               Explore <span className="text-gradient-brand">Opportunities</span>
             </h1>
             <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
               Find the perfect professional for your task. Verified pros, secure payments, and guaranteed results.
             </p>

             <div className="mt-12 max-w-3xl mx-auto flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                   <i className="fas fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
                   <Input
                     value={search}
                     onChange={(e) => handleSearchChange(e.target.value)}
                     placeholder="Search for services, skills or sellers..."
                     className="w-full bg-white/5 border-white/10 rounded-2xl pl-14 pr-6 h-16 text-lg focus-visible:ring-primary focus-visible:bg-white/10 transition-all placeholder:text-slate-600"
                   />
                </div>
                <Button className="h-16 px-10 rounded-2xl bg-gradient-brand text-primary-foreground font-black text-lg shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Search Now
                </Button>
             </div>
           </div>
        </section>

        <section className="container mx-auto py-16 px-4 flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0 space-y-10">
            <div>
               <h3 className="text-xs font-black uppercase tracking-widest text-foreground/50 mb-6 flex items-center gap-2">
                 <i className="fas fa-grid-2 text-[10px]" /> Categories
               </h3>
               <div className="space-y-1.5">
                 <button
                   onClick={() => handleCategoryChange("all")}
                   className={`w-full text-left px-5 py-3 rounded-2xl font-bold text-sm transition-all ${activeCategory === "all" ? "bg-primary text-primary-foreground shadow-glow" : "hover:bg-foreground/5 text-muted-foreground hover:text-foreground"}`}
                 >
                   All Services
                 </button>
                 {MOCK_CATEGORIES.map(c => (
                   <button
                     key={c.id}
                     onClick={() => handleCategoryChange(c.name)}
                     className={`w-full text-left px-5 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-between group ${activeCategory === c.name ? "bg-primary text-primary-foreground shadow-glow" : "hover:bg-foreground/5 text-muted-foreground hover:text-foreground"}`}
                   >
                     <span className="flex items-center gap-3">
                       <i className={`${c.icon} w-5 text-center text-xs opacity-50 group-hover:opacity-100 transition-opacity`} />
                       {c.name}
                     </span>
                     <Badge variant="outline" className={`text-[10px] font-black border-none ${activeCategory === c.name ? "bg-white/20 text-white" : "bg-foreground/5 text-muted-foreground"}`}>
                       {c.count}
                     </Badge>
                   </button>
                 ))}
               </div>
            </div>

            <Separator className="bg-foreground/5" />

            <div>
               <h3 className="text-xs font-black uppercase tracking-widest text-foreground/50 mb-6 flex items-center justify-between">
                 <span>Price Range</span>
                 <span className="text-primary tabular-nums">LKR {priceRange[1].toLocaleString()}</span>
               </h3>
               <div className="px-2">
                 <Slider 
                    defaultValue={[0, 50000]} 
                    max={100000} 
                    step={1000} 
                    onValueChange={setPriceRange}
                    className="cursor-pointer"
                 />
                 <div className="flex justify-between mt-4 text-[10px] font-black text-muted-foreground uppercase">
                   <span>LKR 0</span>
                   <span>LKR 100K+</span>
                 </div>
               </div>
            </div>

            <div className="p-8 bg-slate-950 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
               <div className="absolute inset-0 dot-pattern-light opacity-10" />
               <div className="relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-gradient-brand grid place-items-center text-primary-foreground shadow-soft mb-6">
                   <i className="fas fa-rocket" />
                 </div>
                 <h4 className="font-black text-xl leading-tight">Professional?</h4>
                 <p className="text-sm text-slate-400 mt-3 leading-relaxed">Join Sri Lanka's fastest growing marketplace and start earning.</p>
                 <Button className="w-full mt-8 bg-white text-slate-950 hover:bg-slate-200 rounded-xl font-black h-12 text-sm transition-all">
                    Register as Seller
                 </Button>
               </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                <div>
                  <h2 className="text-2xl font-black text-foreground">Search Results</h2>
                  <p className="text-sm text-muted-foreground mt-1">Found {filtered.length} matching services</p>
                </div>
                <div className="flex items-center gap-3 bg-white border border-foreground/5 p-2 rounded-2xl shadow-soft">
                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-3">Sort by:</span>
                   <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-foreground/5 border-none rounded-xl text-xs font-black focus:ring-0 cursor-pointer h-10 px-4"
                   >
                      <option value="relevant">Most Relevant</option>
                      <option value="rating">Top Rated</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                   </select>
                </div>
             </div>

             <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filtered.map((s) => (
                  <article key={s.id} className="group bg-white border border-foreground/5 rounded-[2.5rem] overflow-hidden hover:shadow-glass hover:-translate-y-2 transition-all duration-500 flex flex-col">
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100" />
                      <i className={`fas ${s.categoryIcon} text-slate-300 text-[9rem] absolute -bottom-8 -right-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700`} />
                      
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/95 text-foreground font-black text-[10px] uppercase border-none shadow-soft">
                          {s.category}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-black">
                        <i className="fas fa-star text-amber-400 text-[10px]" /> {s.rating}
                      </div>
                    </div>

                    <div className="p-7 flex-1 flex flex-col">
                      <h3 className="font-black text-xl text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors min-h-[3rem]">
                        {s.title}
                      </h3>
                      
                      <div className="flex items-center gap-3 mt-6">
                        <div className="relative">
                          <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-black shadow-soft">
                            {s.sellerInitial}
                          </span>
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-foreground/80">{s.seller}</div>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.location}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-8 pt-8 border-t border-foreground/5">
                        <div>
                          <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Starts at</div>
                          <div className="font-black text-2xl text-foreground tabular-nums">{formatPrice(s.price)}</div>
                        </div>
                        <Button className="w-12 h-12 rounded-2xl bg-foreground text-background group-hover:bg-gradient-brand group-hover:text-primary-foreground transition-all duration-300 shadow-soft">
                          <i className="fas fa-arrow-right" />
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
             </div>

             {filtered.length === 0 && (
                <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-foreground/10 shadow-soft animate-in fade-in zoom-in duration-500">
                   <div className="w-24 h-24 bg-foreground/5 rounded-[2rem] grid place-items-center mx-auto mb-8">
                     <i className="fas fa-search-minus text-4xl text-muted-foreground/30" />
                   </div>
                   <h3 className="text-2xl font-black text-foreground">No matches found</h3>
                   <p className="text-base text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
                     Try adjusting your filters or searching for more generic terms.
                   </p>
                   <Button 
                      variant="outline" 
                      className="mt-8 rounded-xl font-black"
                      onClick={() => { setSearch(""); setActiveCategory("all"); setPriceRange([0, 100000]); }}
                   >
                     Reset All Filters
                   </Button>
                </div>
             )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
