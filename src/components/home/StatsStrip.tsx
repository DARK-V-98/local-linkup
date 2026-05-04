const stats = [
  { icon: "fa-users", value: "2.5K+", label: "Verified Pros" },
  { icon: "fa-circle-check", value: "18K+", label: "Successful Tasks" },
  { icon: "fa-grid-2", value: "120+", label: "Service Categories" },
  { icon: "fa-star", value: "4.95", label: "User Satisfaction" },
];

export default function StatsStrip() {
  return (
    <section className="container mx-auto px-4 md:px-0">
      <div className="relative bg-slate-950 rounded-[3rem] p-10 md:p-16 overflow-hidden border border-white/5 shadow-2xl">
        {/* Background Effects */}
        <div className="absolute inset-0 dot-pattern-light opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full -ml-32 -mb-32" />
        
        <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-10 md:gap-16">
          {stats.map((s, i) => (
            <div key={s.label} className="group flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 mb-6">
                <i className={`fas ${s.icon} text-xl`} />
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-4xl md:text-5xl font-[900] text-white tracking-tighter tabular-nums">
                  {s.value}
                </div>
                <div className="text-xs md:text-sm text-slate-400 font-black uppercase tracking-widest mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>
    </section>
  );
}
