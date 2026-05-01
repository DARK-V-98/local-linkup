import { CATEGORY_GRADIENTS } from "@/lib/format";
import { MOCK_CATEGORIES } from "@/data/mock";
import { Link } from "react-router-dom";

export default function CategoriesSection() {
  return (
    <section className="container mx-auto py-12 md:py-20">
      <div className="flex items-end justify-between mb-8 sm:mb-10 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight">Popular categories</h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">Browse the most loved services on Needlyy.</p>
        </div>
        <Link to="/browse" className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-2">
          See all <i className="fas fa-arrow-right text-xs" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {MOCK_CATEGORIES.map((cat, i) => {
          const g = CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length];
          return (
            <Link key={cat.id} to={`/browse?category=${cat.name}`} className="group relative bg-card border border-border rounded-3xl p-5 hover:shadow-glass hover:-translate-y-1 transition-all overflow-hidden">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${g} grid place-items-center text-white shadow-soft group-hover:scale-110 group-hover:rotate-6 transition`}>
                <i className={`${cat.icon} text-xl`} />
              </div>
              <h3 className="mt-4 font-bold text-foreground">{cat.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{cat.description}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground/70 bg-foreground/5 px-2.5 py-1 rounded-full">
                <i className="fas fa-eye text-[10px]" /> Browse · {cat.count}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
