import { useState } from "react";
import { useTopReviews, usePlatformStats } from "@/hooks/usePlatformStats";
import { timeAgo } from "@/lib/format";

const AVATAR_COLORS = [
  "from-rose-500 to-pink-600",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-teal-600",
];

/** A review shaped for the testimonial card. */
interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  rating: number;
  text: string;
  service: string;
}


function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-glass transition">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <i key={s} className={`fas fa-star text-sm ${s <= t.rating ? "text-amber-400" : "text-muted"}`} />
        ))}
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed flex-1">
        <i className="fas fa-quote-left text-primary/20 mr-1 text-lg align-[-2px]" />
        {t.text}
      </p>
      <span className="inline-flex w-fit items-center gap-1.5 bg-primary/5 text-primary text-[10px] font-bold px-3 py-1 rounded-full">
        <i className="fas fa-tag" /> {t.service}
      </span>
      <div className="flex items-center gap-3 pt-1 border-t border-border">
        <span className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} text-white grid place-items-center font-black text-sm shadow-soft shrink-0`}>
          {t.avatar}
        </span>
        <div>
          <div className="text-sm font-black text-foreground">{t.name}</div>
          <div className="text-[11px] text-muted-foreground">{t.role}</div>
        </div>
        <i className="fas fa-circle-check text-emerald-500 ml-auto text-sm" title="Verified review" />
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const { reviews, loading } = useTopReviews(6);
  const { averageRating, reviewCount } = usePlatformStats();

  const testimonials: Testimonial[] = reviews.map((r, i) => ({
    id: r.id,
    name: r.author,
    role: timeAgo(r.date),
    avatar: r.initial,
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
    rating: r.rating,
    text: r.text,
    service: "Verified booking",
  }));

  // No reviews yet — omit the section rather than invent social proof.
  if (loading || testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50/50 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-foreground/5 rounded-full px-4 py-1.5 text-xs font-bold text-foreground/70">
            <i className="fas fa-star text-amber-400" /> Real stories from real users
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-black tracking-tight">
            Trusted across <span className="text-gradient-brand">Sri Lanka</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            From emergency repairs to growing freelance businesses — hear what our community says.
          </p>
        </div>

        {/* Stars summary bar */}
        <div className="flex flex-wrap justify-center gap-8 mb-14">
          {[
            { label: "Average Rating", val: `${averageRating.toFixed(1)}/5`, icon: "fa-star", color: "text-amber-400" },
            { label: reviewCount === 1 ? "Review" : "Reviews", val: reviewCount.toLocaleString(), icon: "fa-comment-dots", color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2.5">
              <i className={`fas ${s.icon} ${s.color} text-lg`} />
              <div>
                <div className="font-black text-foreground text-sm leading-none">{s.val}</div>
                <div className="text-[11px] text-muted-foreground">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="sm:hidden">
          <div className="overflow-hidden">
            <TestimonialCard t={testimonials[activeIdx]} />
          </div>
          <div className="flex justify-center items-center gap-3 mt-6">
            <button
              onClick={() => setActiveIdx((i) => (i - 1 + testimonials.length) % testimonials.length)}
              className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 grid place-items-center transition"
            >
              <i className="fas fa-chevron-left text-xs" />
            </button>
            <div className="flex gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  className={`rounded-full transition-all ${i === activeIdx ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-foreground/20"}`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveIdx((i) => (i + 1) % testimonials.length)}
              className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 grid place-items-center transition"
            >
              <i className="fas fa-chevron-right text-xs" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
