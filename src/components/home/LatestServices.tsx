import { MOCK_LATEST_SERVICES } from "@/data/mock";
import { SERVICE_GRADIENTS, formatPrice, timeAgo } from "@/lib/format";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function LatestServices() {
  return (
    <section className="container mx-auto py-20 md:py-32">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">
            <i className="fas fa-sparkles" /> Fresh Opportunities
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">
            Recently <span className="text-blue-600">added</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground/80 leading-relaxed max-w-xl">
            Explore the newest talent and services that just landed on our marketplace.
          </p>
        </div>
        <Link 
          to="/browse" 
          className="group inline-flex items-center gap-3 text-sm font-black text-foreground hover:text-primary transition-all bg-foreground/5 px-6 py-3 rounded-full hover:bg-primary/5 border border-transparent hover:border-primary/20"
        >
          Explore All New
          <i className="fas fa-arrow-right text-xs transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MOCK_LATEST_SERVICES.map((s, i) => {
          const g = SERVICE_GRADIENTS[i % SERVICE_GRADIENTS.length];
          return (
            <Link 
              key={s.id} 
              to="/browse" 
              className="group bg-white/40 backdrop-blur-sm border border-white/10 rounded-[2rem] overflow-hidden hover:shadow-glass hover:-translate-y-2 transition-all duration-500 text-left flex flex-col"
            >
              <div className={`relative h-40 bg-gradient-to-br ${g} overflow-hidden`}>
                <i className={`fas ${s.categoryIcon} text-white/20 text-7xl absolute -bottom-4 -right-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700`} />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 text-foreground font-black text-[10px] uppercase border-none">
                    {s.category}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/10">
                  NEW
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-black text-lg text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors mb-4">
                  {s.title}
                </h3>
                
                <div className="flex items-center gap-2 mt-auto">
                  <span className="grid place-items-center w-7 h-7 rounded-lg bg-gradient-brand text-primary-foreground text-[10px] font-black shadow-soft">
                    {s.sellerInitial}
                  </span>
                  <span className="text-xs font-black text-foreground/80">{s.seller}</span>
                  <div className="ml-auto flex items-center gap-1 text-[11px] font-bold text-muted-foreground bg-foreground/5 px-2 py-0.5 rounded-full">
                    <i className="fas fa-star text-amber-500 text-[10px]" /> {s.rating}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-4 text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">
                  <i className="fas fa-location-dot" /> {s.location} · {timeAgo(s.postedAt)}
                </div>

                <div className="flex items-center justify-between mt-5 pt-5 border-t border-foreground/5">
                  <div>
                    <span className="text-[9px] font-black text-muted-foreground uppercase block leading-none mb-1">Fixed Price</span>
                    <span className="font-black text-xl text-foreground">{formatPrice(s.price)}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-black uppercase bg-foreground/5 px-2.5 py-1 rounded-lg">{s.type}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
