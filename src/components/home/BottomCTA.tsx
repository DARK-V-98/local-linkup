import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  { icon: "fa-lock", title: "Secure Payouts" },
  { icon: "fa-award", title: "Verified Professionals" },
  { icon: "fa-message", title: "Encrypted Chat" },
  { icon: "fa-bolt-lightning", title: "Swift Completion" },
];

export default function BottomCTA() {
  return (
    <section className="container mx-auto px-4 md:px-0 py-20">
      <div className="relative bg-slate-950 rounded-[3.5rem] p-10 md:p-24 text-center overflow-hidden border border-white/5 shadow-2xl">
        {/* Dynamic Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 blur-[140px] rounded-full -translate-y-1/2 opacity-70" />
        <div className="absolute inset-0 dot-pattern-light opacity-10 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-[10px] font-black text-primary uppercase tracking-widest mb-8">
            <i className="fas fa-sparkles" /> Start Your Journey
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-[900] text-white tracking-tight max-w-4xl mx-auto leading-[1.1] mb-8">
            Ready to get something <br className="hidden md:block" />
            <span className="text-gradient-brand">exceptional</span> done?
          </h2>
          
          <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Join thousands of satisfied users in Sri Lanka's most trusted marketplace. Whether you're hiring or selling, we've got you covered.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20">
            <Link to="/role-selection?mode=register">
              <Button className="bg-gradient-brand text-primary-foreground h-16 px-12 rounded-[1.5rem] font-black text-lg shadow-glow hover:scale-105 transition-all">
                Get Started Free <i className="fas fa-arrow-right ml-3" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="h-16 px-10 rounded-[1.5rem] text-white font-bold hover:bg-white/5 border border-white/10 text-lg">
                Sign in to Account
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {features.map((f) => (
              <div 
                key={f.title} 
                className="group flex flex-col items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <i className={`fas ${f.icon} text-lg`} />
                </div>
                <div className="text-xs md:text-sm font-black text-white/80 uppercase tracking-wider">{f.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating background elements */}
        <div className="absolute top-1/4 left-10 animate-float opacity-10 hidden lg:block">
          <i className="fas fa-code text-6xl text-primary" />
        </div>
        <div className="absolute bottom-1/4 right-10 animate-float-slow opacity-10 hidden lg:block">
          <i className="fas fa-camera text-6xl text-secondary" />
        </div>
      </div>
    </section>
  );
}
