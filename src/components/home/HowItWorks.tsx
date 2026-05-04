const steps = [
  { 
    icon: "fa-magnifying-glass", 
    title: "Discover Experts", 
    desc: "Search through our verified network of professionals or browse by categories to find your perfect match.", 
    grad: "from-blue-500 to-indigo-600" 
  },
  { 
    icon: "fa-comments-dollar", 
    title: "Secure Booking", 
    desc: "Chat with pros, get custom quotes, and book securely. Your funds are held safely until the task is complete.", 
    grad: "from-emerald-500 to-green-600" 
  },
  { 
    icon: "fa-circle-check", 
    title: "Project Success", 
    desc: "Your pro completes the job to your satisfaction. Release payment and leave a review for the community.", 
    grad: "from-amber-500 to-orange-600" 
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-40 overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
      
      {/* Decorative background blobs */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto relative px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/5 text-foreground/50 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            Our Process
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none">
            From idea to done in <span className="text-primary">simple steps.</span>
          </h2>
          <p className="mt-6 text-base md:text-xl text-muted-foreground/70 leading-relaxed max-w-2xl mx-auto">
            We've streamlined the service marketplace experience to be as smooth as possible for both buyers and sellers.
          </p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-12 lg:gap-20">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
          
          {steps.map((s, i) => (
            <div key={s.title} className="group relative flex flex-col items-center text-center">
              <div className="relative z-10">
                <div className={`w-32 h-32 rounded-[2.5rem] bg-gradient-to-br ${s.grad} grid place-items-center text-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <i className={`fas ${s.icon} text-4xl`} />
                </div>
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-2xl bg-white border border-foreground/5 shadow-glass grid place-items-center text-lg font-black text-foreground">
                  0{i + 1}
                </div>
              </div>
              
              <h3 className="mt-10 text-2xl font-black text-foreground">{s.title}</h3>
              <p className="mt-4 text-sm md:text-base text-muted-foreground/80 leading-relaxed max-w-xs">
                {s.desc}
              </p>
              
              {/* Progress arrow for mobile/desktop spacing */}
              {i < steps.length - 1 && (
                <div className="md:hidden my-8 opacity-20">
                  <i className="fas fa-arrow-down text-2xl" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
