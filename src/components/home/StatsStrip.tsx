const stats = [
  { icon: "fa-users", value: "2,500+", label: "Active Sellers" },
  { icon: "fa-circle-check", value: "18,000+", label: "Tasks Completed" },
  { icon: "fa-grid-2", value: "100+", label: "Categories" },
  { icon: "fa-star", value: "4.9 / 5", label: "Average Rating" },
];

export default function StatsStrip() {
  return (
    <section className="container mx-auto">
      <div className="relative bg-slate-900 rounded-[2rem] p-8 md:p-12 overflow-hidden">
        <div className="absolute inset-0 dot-pattern-light opacity-50" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/30 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-secondary/30 blur-3xl rounded-full" />
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <span className="grid place-items-center md:place-items-start w-12 h-12 rounded-2xl bg-white/10 text-primary-glow mx-auto md:mx-0">
                <i className={`fas ${s.icon} text-xl pl-0 md:pl-3`} />
              </span>
              <div className="text-3xl md:text-4xl font-black text-white mt-3">{s.value}</div>
              <div className="text-sm text-slate-400 font-semibold mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
