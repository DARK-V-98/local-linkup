import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  { icon: "fa-rocket", title: "Grow Rapidly", desc: "Access thousands of qualified buyers from day one." },
  { icon: "fa-money-bill-wave", title: "Secure Payouts", desc: "Guaranteed payments held in secure escrow." },
  { icon: "fa-clock", title: "Absolute Freedom", desc: "You control your schedule, pricing, and clients." },
  { icon: "fa-shield-halved", title: "Trusted Profile", desc: "Gain instant credibility with our verification badge." },
];

export default function SellerCTA() {
  return (
    <section className="container mx-auto py-20 md:py-32">
      <div className="relative bg-slate-950 rounded-[3.5rem] p-10 sm:p-14 md:p-20 overflow-hidden border border-white/5 shadow-2xl">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 blur-[140px] rounded-full -mr-48 -mt-48 opacity-60" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/15 blur-[120px] rounded-full -ml-32 -mb-32 opacity-40" />
        <div className="absolute inset-0 dot-pattern-light opacity-10" />

        <div className="relative grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-[10px] font-black text-primary uppercase tracking-widest mb-6">
              <i className="fas fa-briefcase" /> Business Opportunity
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
              Turn your <span className="text-gradient-brand">talent</span> into a <br /> 
              global brand.
            </h2>
            <p className="text-base md:text-lg text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed mb-10">
              Join a community of 2,500+ professionals who have found financial independence on Needlyy. Start your journey in less than 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/role-selection?mode=register">
                <Button className="bg-gradient-brand text-primary-foreground h-14 px-10 rounded-2xl font-black text-base shadow-glow hover:scale-105 transition-all">
                  Get Started Now <i className="fas fa-arrow-right ml-2" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="ghost" className="h-14 px-8 rounded-2xl text-white font-bold hover:bg-white/5 border border-white/10">
                  How it works
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <div 
                key={f.title} 
                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 hover:bg-white/10 hover:border-white/20 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-brand grid place-items-center text-primary-foreground shadow-soft group-hover:rotate-6 transition-transform">
                  <i className={`fas ${f.icon} text-lg`} />
                </div>
                <h4 className="text-white font-black mt-5 text-lg leading-tight">{f.title}</h4>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
