import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HeroSection() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/browse?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-gradient-hero">
      {/* Background dynamic elements */}
      <div className="absolute inset-0 grid-overlay pointer-events-none opacity-40" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 animate-morph blur-[100px]" />
      <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-secondary/15 animate-morph blur-[120px]" style={{ animationDelay: "-4s" }} />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-200/20 animate-morph blur-[100px]" style={{ animationDelay: "-8s" }} />

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 text-xs font-black text-foreground/70 mb-8 shadow-glass animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            SRI LANKA'S #1 PROFESSIONAL SERVICES NETWORK
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-[900] tracking-tight leading-[0.95] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Find the perfect <br />
            <span className="text-gradient-brand">local expert</span> for <br className="hidden sm:block" />
            any task.
          </h1>

          {/* Subtext */}
          <p className="text-base md:text-xl text-muted-foreground/80 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            From award-winning developers to certified plumbers — discover, book, and pay verified local professionals in one seamless platform.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
            <form 
              onSubmit={handleSearch}
              className="bg-white/80 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-2 md:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col sm:flex-row items-center gap-3 transition-all focus-within:shadow-[0_25px_60px_rgba(var(--primary),0.15)] group"
            >
              <div className="flex items-center gap-4 px-5 flex-1 w-full">
                <i className="fas fa-magnifying-glass text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  value={q} 
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="What service do you need today?"
                  className="bg-transparent border-none outline-none flex-1 py-4 text-base md:text-lg font-medium placeholder:text-muted-foreground/60"
                />
              </div>
              <Button 
                type="submit"
                className="w-full sm:w-auto bg-gradient-brand text-primary-foreground font-black px-10 h-14 rounded-full shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all text-base"
              >
                Search
              </Button>
            </form>

            {/* Popular Searches */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="text-xs font-bold text-muted-foreground/60 py-1.5 uppercase tracking-wider">Popular:</span>
              {["Web Design", "House Cleaning", "Tutoring", "Fix & Repair"].map((tag) => (
                <button 
                  key={tag}
                  onClick={() => { setQ(tag); navigate(`/browse?q=${tag}`); }}
                  className="text-xs font-bold px-4 py-1.5 rounded-full bg-white/40 border border-white/10 hover:bg-primary/10 hover:text-primary transition-all backdrop-blur-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: "fa-shield-halved", title: "Verified Pros", desc: "Every seller is background checked." },
            { icon: "fa-lock", title: "Secure Payments", desc: "Funds held in escrow until completion." },
            { icon: "fa-bolt-lightning", title: "Instant Booking", desc: "Get matches in minutes, not days." },
          ].map((f, i) => (
            <div 
              key={i}
              className="bg-white/30 backdrop-blur-lg border border-white/10 rounded-3xl p-6 flex items-start gap-4 hover:bg-white/50 transition-colors group animate-in fade-in slide-in-from-bottom-20 duration-700"
              style={{ animationDelay: `${400 + i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-brand grid place-items-center text-primary-foreground shadow-soft group-hover:rotate-6 transition-transform">
                <i className={`fas ${f.icon} text-lg`} />
              </div>
              <div>
                <h4 className="font-black text-foreground">{f.title}</h4>
                <p className="text-sm text-muted-foreground leading-snug mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Floating Elements (Desktop only) */}
      <div className="hidden xl:block">
        <div className="absolute top-1/3 left-10 animate-float-slow opacity-20">
          <i className="fas fa-code text-6xl text-primary" />
        </div>
        <div className="absolute top-1/4 right-10 animate-float opacity-20" style={{ animationDelay: "-2s" }}>
          <i className="fas fa-camera text-6xl text-secondary" />
        </div>
        <div className="absolute bottom-1/3 left-20 animate-float opacity-20" style={{ animationDelay: "-4s" }}>
          <i className="fas fa-hammer text-5xl text-amber-500" />
        </div>
        <div className="absolute bottom-1/4 right-20 animate-float-slow opacity-20" style={{ animationDelay: "-6s" }}>
          <i className="fas fa-graduation-cap text-5xl text-fuchsia-500" />
        </div>
      </div>
    </section>
  );
}
