import { MOCK_LATEST_SERVICES } from "@/data/mock";
import { SERVICE_GRADIENTS, formatPrice, timeAgo } from "@/lib/format";
import { Link } from "react-router-dom";

export default function LatestServices() {
  return (
    <section className="container mx-auto py-12 md:py-20">
      <div className="flex items-end justify-between mb-8 sm:mb-10 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight">Recently added</h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">Fresh listings from sellers across Sri Lanka.</p>
        </div>
        <Link to="/browse" className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-2">
          Browse all <i className="fas fa-arrow-right text-xs" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {MOCK_LATEST_SERVICES.map((s, i) => {
          const g = SERVICE_GRADIENTS[i % SERVICE_GRADIENTS.length];
          return (
            <Link key={s.id} to={`/service/${s.id}`} className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-glass hover:-translate-y-1 transition-all text-left">
              <div className={`relative h-32 bg-gradient-to-br ${g} overflow-hidden`}>
                <i className={`fas ${s.categoryIcon} text-white/30 text-7xl absolute -bottom-2 -right-2 group-hover:rotate-12 transition`} />
                <span className="absolute top-3 left-3 bg-white/95 text-foreground text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                  {s.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground line-clamp-2 leading-snug min-h-[2.6rem]">{s.title}</h3>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground font-semibold">
                  <span className="grid place-items-center w-6 h-6 rounded-full bg-gradient-brand text-primary-foreground text-[10px] font-black">{s.sellerInitial}</span>
                  {s.seller}
                  <span className="ml-auto inline-flex items-center gap-1"><i className="fas fa-star text-amber-500 text-[10px]" /> {s.rating}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground font-semibold">
                  <i className="fas fa-location-dot" /> {s.location} · {timeAgo(s.postedAt)}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="font-black text-foreground">{formatPrice(s.price)}</span>
                  <span className="text-[11px] text-muted-foreground font-bold">{s.type}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
