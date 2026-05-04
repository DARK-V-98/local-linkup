import { MOCK_TOP_SERVICES } from "@/data/mock";
import { formatPrice } from "@/lib/format";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const headerGradients = [
  "from-emerald-400 to-green-500",
  "from-blue-400 to-indigo-500",
  "from-amber-400 to-orange-500",
  "from-purple-400 to-violet-500",
];

export default function TopRatedServices() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(w => w !== id));
      toast.info("Removed from wishlist");
    } else {
      setWishlist([...wishlist, id]);
      toast.success("Added to wishlist!");
    }
  };

  return (
    <section className="container mx-auto py-20 md:py-32">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest mb-4">
            <i className="fas fa-crown" /> Featured Experts
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">
            Top rated <span className="text-amber-500">services</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground/80 leading-relaxed max-w-xl">
            Hand-picked sellers with a proven track record of excellence and 100% customer satisfaction.
          </p>
        </div>
        <Link 
          to="/browse" 
          className="group inline-flex items-center gap-3 text-sm font-black text-foreground hover:text-primary transition-all bg-foreground/5 px-6 py-3 rounded-full hover:bg-primary/5 border border-transparent hover:border-primary/20"
        >
          See All Experts
          <i className="fas fa-arrow-right text-xs transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {MOCK_TOP_SERVICES.map((s, i) => {
          const g = headerGradients[i % headerGradients.length];
          const isLiked = wishlist.includes(s.id);
          
          return (
            <Link 
              key={s.id} 
              to="/browse" 
              className="group bg-white/40 backdrop-blur-sm border border-white/20 rounded-[2.5rem] overflow-hidden hover:shadow-glass hover:-translate-y-2 transition-all duration-500 text-left"
            >
              <div className={`relative h-48 bg-gradient-to-br ${g} overflow-hidden`}>
                <i className={`fas ${s.categoryIcon} text-white/20 text-[9rem] absolute -bottom-8 -right-6 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700`} />
                
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-foreground shadow-soft">
                  <i className={`${s.badgeIcon} text-amber-500`} /> {s.badge.toUpperCase()}
                </div>

                <button 
                  onClick={(e) => toggleWishlist(s.id, e)}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isLiked ? "bg-red-500 text-white" : "bg-white/90 text-foreground/40 hover:text-red-500"
                  } shadow-soft`}
                >
                  <i className={`${isLiked ? "fas" : "far"} fa-heart text-sm`} />
                </button>

                <div className="absolute bottom-4 left-4 inline-flex items-center gap-1 bg-black/30 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-black">
                  <i className="fas fa-star text-amber-400 text-[10px]" /> {s.rating}
                </div>
              </div>

              <div className="p-7">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">{s.category}</span>
                <h3 className="font-black text-xl text-foreground mt-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {s.title}
                </h3>
                
                <div className="flex items-center gap-3 mt-5">
                  <div className="relative">
                    <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-brand text-primary-foreground text-xs font-black shadow-soft">
                      {s.sellerInitial}
                    </span>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-foreground/80">{s.seller}</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">{s.reviews} verified reviews</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-6 border-t border-foreground/5">
                  <div>
                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Starts at</div>
                    <div className="font-black text-2xl text-foreground">{formatPrice(s.price)}</div>
                  </div>
                  <Button className="w-12 h-12 rounded-2xl bg-foreground text-background group-hover:bg-gradient-brand group-hover:text-primary-foreground transition-all duration-300">
                    <i className="fas fa-arrow-right" />
                  </Button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
