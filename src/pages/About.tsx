import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="pt-20">
        {/* Cinematic Hero Section */}
        <section className="relative py-32 md:py-48 overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 dot-pattern-light opacity-10 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 blur-[140px] rounded-full -mr-48 -mt-48" />
          
          <div className="container mx-auto relative px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] mb-10 text-primary">
              Our Vision & Story
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] mb-10">
              Empowering the <br />
              <span className="text-gradient-brand">local spirit.</span>
            </h1>
            <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
              Needlyy is more than a marketplace. It's a movement to digitize trust, quality, and opportunity across every corner of Sri Lanka.
            </p>
          </div>
        </section>

        {/* Narrative Section */}
        <section className="container mx-auto py-32 px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 blur-[80px] rounded-full" />
              <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-2xl border border-foreground/5 group">
                <div className="absolute inset-0 bg-slate-900 grid place-items-center">
                   <i className="fas fa-handshake-angle text-[10rem] text-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                   <div className="absolute bottom-12 left-12 right-12 text-white">
                      <div className="text-xs font-black uppercase tracking-widest text-primary mb-2">Our Founder's Motto</div>
                      <h3 className="text-3xl font-black italic leading-tight">"Reliability shouldn't be a luxury. It should be the standard."</h3>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-12">
              <div>
                <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-none mb-8">
                  Built on <span className="text-primary">trust</span>,<br />
                  fueled by excellence.
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  The idea for Needlyy was born out of a simple frustration: why is it so hard to find someone you can trust? We set out to create a platform where verification isn't just a checkbox, but a commitment.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                {[
                  { icon: "fa-shield-check", title: "Strict Verification", desc: "Every professional undergoes a rigorous background and skills assessment." },
                  { icon: "fa-lock-hashtag", title: "Secure Transactions", desc: "Funds are protected by smart escrow until you're 100% satisfied." },
                  { icon: "fa-gem", title: "Premium Quality", desc: "We curate only the top 5% of applicants in each service category." },
                  { icon: "fa-heart", title: "Community Focused", desc: "A portion of our platform fees goes back to supporting local trade education." },
                ].map((f) => (
                  <div key={f.title} className="group">
                    <div className="w-12 h-12 rounded-2xl bg-foreground/5 grid place-items-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-soft">
                      <i className={`fas ${f.icon} text-lg`} />
                    </div>
                    <h4 className="font-black text-foreground mt-5 text-lg leading-tight">{f.title}</h4>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed opacity-70">
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Milestone */}
        <section className="bg-slate-950 py-32 relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern-light opacity-10" />
          <div className="container mx-auto relative px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              {[
                { label: "Verified Pros", value: "2.5K+", icon: "fa-user-check" },
                { label: "Tasks Done", value: "18K+", icon: "fa-check-circle" },
                { label: "User Rating", value: "4.95", icon: "fa-star" },
                { label: "Cities", value: "30+", icon: "fa-location-dot" },
              ].map((s) => (
                <div key={s.label} className="group">
                  <div className="text-4xl md:text-6xl font-[900] text-white tracking-tighter mb-2 group-hover:scale-110 transition-transform duration-300">
                    {s.value}
                  </div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ultimate CTA */}
        <section className="container mx-auto py-32 px-4">
          <div className="bg-slate-100 rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-soft border border-foreground/5">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[100px] rounded-full" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-black tracking-tight leading-tight mb-8">
                The future of work <br className="hidden md:block" />
                starts <span className="text-primary">here.</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto mb-12 leading-relaxed">
                Whether you're looking for your next big project or need an expert hand, Needlyy is the home for Sri Lanka's best talent.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link to="/role-selection?mode=register">
                  <Button className="h-16 px-12 rounded-2xl bg-slate-950 text-white font-black text-lg hover:scale-105 transition-all shadow-xl">
                    Join as Professional
                  </Button>
                </Link>
                <Link to="/register/buyer">
                  <Button variant="outline" className="h-16 px-12 rounded-2xl border-slate-300 font-black text-lg hover:bg-slate-200 transition-all">
                    Hire an Expert
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
