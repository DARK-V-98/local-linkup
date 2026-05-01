import { MOCK_TOP_SERVICES } from "@/data/mock";
import { formatPrice, timeAgo } from "@/lib/format";
import { Link } from "react-router-dom";

const headerGradients = [
  "from-emerald-400 to-green-500",
  "from-blue-400 to-indigo-500",
  "from-amber-400 to-orange-500",
  "from-purple-400 to-violet-500",
];

export default function TopRatedServices() {
  return (
    <section className="container mx-auto py-12 md:py-20">
      <div className="flex items-end justify-between mb-8 sm:mb-10 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight">Top rated services</h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">Hand-picked sellers with the best reviews.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_TOP_SERVICES.map((s, i) => {
          const g = headerGradients[i % headerGradients.length];
          return (
            <Link key={s.id} to="/browse" className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-glass hover:-translate-y-1 transition-all text-left">
              <div className={`relative h-40 bg-gradient-to-br ${g} overflow-hidden`}>
                <i className={`fas ${s.categoryIcon} text-white/30 text-[8rem] absolute -bottom-6 -right-4 group-hover:scale-110 transition`} />
                <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 px-3 py-1 rounded-full text-[11px] font-bold text-foreground">
                  <i className={`${s.badgeIcon} text-amber-500`} /> {s.badge}
                </div>
                <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-foreground/30 backdrop-blur text-white px-2.5 py-1 rounded-full text-xs font-bold">
                  <i className="fas fa-star text-amber-300 text-[10px]" /> {s.rating}
                </div>
              </div>
              <div className="p-5">
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{s.category}</span>
                <h3 className="font-bold text-foreground mt-1 line-clamp-2 leading-snug">{s.title}</h3>
                <div className="flex items-center gap-2 mt-3">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-gradient-brand text-primary-foreground text-xs font-black">{s.sellerInitial}</span>
                  <span className="text-xs font-semibold text-muted-foreground">{s.seller} · {s.reviews} reviews</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase">Starting at</div>
                    <div className="font-black text-foreground">{formatPrice(s.price)}</div>
                  </div>
                  <button className="grid place-items-center w-10 h-10 rounded-xl bg-foreground/5 group-hover:bg-gradient-brand group-hover:text-primary-foreground transition">
                    <i className="fas fa-arrow-right" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
