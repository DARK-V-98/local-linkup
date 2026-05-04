import { CATEGORY_GRADIENTS } from "@/lib/format";
import { MOCK_CATEGORIES } from "@/data/mock";
import { Link } from "react-router-dom";

export default function CategoriesSection() {
  return (
    <section className="container mx-auto py-20 md:py-32">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
            Explore Categories
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">
            What are you <span className="text-primary">looking</span> for?
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground/80 leading-relaxed">
            Discover the perfect professional across our most popular categories. From digital services to local trade tasks.
          </p>
        </div>
        <Link 
          to="/browse" 
          className="group inline-flex items-center gap-3 text-sm font-black text-foreground hover:text-primary transition-all bg-foreground/5 px-6 py-3 rounded-full hover:bg-primary/5 border border-transparent hover:border-primary/20"
        >
          View All Categories 
          <i className="fas fa-arrow-right text-xs transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        {MOCK_CATEGORIES.map((cat, i) => {
          const g = CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length];
          return (
            <Link 
              key={cat.id} 
              to={`/browse?category=${cat.name}`} 
              className="group relative bg-white/40 backdrop-blur-sm border border-white/20 rounded-[2.5rem] p-8 hover:shadow-glass hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fas fa-arrow-up-right text-xs text-muted-foreground" />
              </div>
              
              <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${g} grid place-items-center text-white shadow-soft group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                <i className={`${cat.icon} text-2xl`} />
              </div>
              
              <h3 className="mt-6 font-black text-xl text-foreground leading-tight">{cat.name}</h3>
              <p className="text-sm text-muted-foreground/70 mt-2 line-clamp-2 leading-snug group-hover:text-muted-foreground transition-colors">
                {cat.description}
              </p>
              
              <div className="mt-6 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter text-foreground/50 bg-foreground/5 px-3 py-1.5 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  {cat.count} Services
                </span>
              </div>

              {/* Decorative blob on hover */}
              <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
