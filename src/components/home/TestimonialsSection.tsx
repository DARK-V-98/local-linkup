const TESTIMONIALS = [
  {
    name: "Kamani Rathnayake",
    role: "Buyer · Colombo",
    avatar: "K",
    color: "from-rose-500 to-pink-600",
    rating: 5,
    text: "Found a plumber within 20 minutes during a pipe burst emergency. The video verification gave me confidence before he even arrived. Incredible service.",
    service: "Emergency Plumbing",
  },
  {
    name: "Tharindu Perera",
    role: "Seller · Kandy",
    avatar: "T",
    color: "from-violet-500 to-purple-600",
    rating: 5,
    text: "My income doubled in 3 months after joining Needlyy as a freelance graphic designer. The platform handles the trust side so I can focus on my craft.",
    service: "Graphic Design",
  },
  {
    name: "Dilshan Wickramasinghe",
    role: "Buyer · Galle",
    avatar: "D",
    color: "from-sky-500 to-blue-600",
    rating: 5,
    text: "Posted a job request for website development and had 5 quotes within 2 hours. Hired someone that same day. Way easier than searching on Facebook groups.",
    service: "Web Development",
  },
  {
    name: "Nirmala Jayawardena",
    role: "Buyer · Negombo",
    avatar: "N",
    color: "from-emerald-500 to-teal-600",
    rating: 5,
    text: "As a working mum, Needlyy saves me hours every week. I've found a reliable cleaner, AC technician, and tutor all in one place. The WhatsApp booking is seamless.",
    service: "Multiple Services",
  },
  {
    name: "Sumudu Fernando",
    role: "Seller · Colombo",
    avatar: "S",
    color: "from-amber-500 to-orange-600",
    rating: 5,
    text: "I run a photography studio. Needlyy brings me 60% of my bookings now. The seller dashboard and earnings tracker make running the business so much cleaner.",
    service: "Photography",
  },
  {
    name: "Priya Srikanth",
    role: "Overseas · Dubai",
    avatar: "P",
    color: "from-indigo-500 to-blue-600",
    rating: 5,
    text: "I'm based in Dubai and Needlyy's Overseas service manages my Colombo property. Monthly video reports straight to WhatsApp. Complete peace of mind from 4,000km away.",
    service: "Overseas Property Care",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50/50 to-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-foreground/5 rounded-full px-4 py-1.5 text-xs font-bold text-foreground/70">
            <i className="fas fa-star text-amber-400" /> Real stories from real users
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-black tracking-tight">
            Trusted by <span className="text-gradient-brand">18,000+</span> Sri Lankans
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            From emergency repairs to growing freelance businesses — hear what our community says.
          </p>
        </div>

        {/* Stars summary bar */}
        <div className="flex flex-wrap justify-center gap-8 mb-14">
          {[
            { label: "Average Rating", val: "4.9/5", icon: "fa-star", color: "text-amber-400" },
            { label: "Reviews", val: "12,400+", icon: "fa-comment-dots", color: "text-primary" },
            { label: "Repeat Buyers", val: "78%", icon: "fa-arrow-rotate-right", color: "text-emerald-500" },
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

        {/* Testimonials grid — 2 rows, 3 cols on desktop, scrollable on mobile */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="bg-card border border-border rounded-3xl p-6 flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-glass transition"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <i key={s} className={`fas fa-star text-sm ${s <= t.rating ? "text-amber-400" : "text-muted"}`} />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-foreground/80 leading-relaxed flex-1">
                <i className="fas fa-quote-left text-primary/20 mr-1 text-lg align-[-2px]" />
                {t.text}
              </p>

              {/* Service tag */}
              <span className="inline-flex w-fit items-center gap-1.5 bg-primary/5 text-primary text-[10px] font-bold px-3 py-1 rounded-full">
                <i className="fas fa-tag" /> {t.service}
              </span>

              {/* Author */}
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
          ))}
        </div>
      </div>
    </section>
  );
}
