const steps = [
  { icon: "fa-magnifying-glass", title: "Find", desc: "Search across 100+ categories or browse top-rated sellers near you.", grad: "from-blue-400 to-indigo-500" },
  { icon: "fa-comments", title: "Book & Chat", desc: "Compare quotes, message sellers and book in seconds — securely.", grad: "from-emerald-400 to-green-500" },
  { icon: "fa-circle-check", title: "Get it Done", desc: "Your pro completes the job. Pay safely and rate your experience.", grad: "from-amber-400 to-orange-500" },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24">
      <div className="absolute inset-0 dot-pattern opacity-50 pointer-events-none" />
      <div className="container mx-auto relative">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 bg-foreground/5 rounded-full px-4 py-1.5 text-xs font-bold text-foreground/70">
            <i className="fas fa-route text-primary" /> How it works
          </span>
          <h2 className="mt-4 text-3xl md:text-5xl font-black tracking-tight">From idea to done in 3 simple steps</h2>
        </div>

        <div className="relative grid md:grid-cols-3 gap-8">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] border-t-2 border-dashed border-foreground/15" />
          {steps.map((s, i) => (
            <div key={s.title} className="relative bg-card border border-border rounded-3xl p-7 text-center shadow-soft hover:shadow-glass transition">
              <div className="relative inline-block">
                <span className={`grid place-items-center w-20 h-20 rounded-3xl bg-gradient-to-br ${s.grad} text-white shadow-glow`}>
                  <i className={`fas ${s.icon} text-2xl`} />
                </span>
                <span className="absolute -top-2 -right-2 grid place-items-center w-8 h-8 rounded-full bg-foreground text-background text-xs font-black">{i + 1}</span>
              </div>
              <h3 className="mt-5 text-xl font-black">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
