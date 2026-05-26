import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/lib/usePageTitle";

export default function About() {
  usePageTitle("About Needlyy");
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-hero">
          <div className="absolute inset-0 grid-overlay pointer-events-none opacity-40" />
          <div className="absolute top-20 right-20 w-80 h-80 bg-primary/10 blur-3xl rounded-full animate-morph" />
          <div className="container mx-auto relative text-center">
            <span className="inline-flex items-center gap-2 bg-foreground/5 rounded-full px-4 py-1.5 text-xs font-bold text-foreground/70 mb-6">
              <i className="fas fa-circle-info text-primary" /> Our Story
            </span>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight">
              Empowering Sri Lanka's <br />
              <span className="text-gradient-brand">local talent.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Needlyy is the island's most trusted marketplace, built to connect thousands of skilled professionals with buyers who value quality and reliability.
            </p>
          </div>
        </section>

        {/* Vision/Mission */}
        <section className="container mx-auto py-24 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-brand opacity-10 blur-2xl rounded-[3rem] group-hover:opacity-20 transition" />
            <div className="relative aspect-square rounded-[3rem] bg-slate-900 overflow-hidden shadow-glass border border-white/10">
              <div className="absolute inset-0 dot-pattern-light opacity-30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 rounded-3xl bg-gradient-brand grid place-items-center mb-8 shadow-glow animate-float">
                  <i className="fas fa-eye text-4xl text-primary-foreground" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">Our Vision</h3>
                <p className="text-slate-300 leading-relaxed">
                  To become the digital backbone of Sri Lanka's service economy, where every skill is valued and every connection is secure.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">Why we built Needlyy</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Finding a reliable plumber, a talented web developer, or a dedicated tutor shouldn't be a gamble. We built Needlyy to solve the trust gap in the local service market.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: "fa-shield-halved", title: "Trust First", desc: "Every seller is verified by our team." },
                { icon: "fa-bolt", title: "Instant Access", desc: "Book in seconds, chat in real-time." },
                { icon: "fa-lock", title: "Secure Escrow", desc: "We hold funds until the job is done." },
                { icon: "fa-face-smile", title: "Satisfaction", desc: "Rated 4.9/5 by 18,000+ users." },
              ].map((f) => (
                <div key={f.title} className="bg-card border border-border rounded-2xl p-6 hover:shadow-soft transition">
                  <span className="grid place-items-center w-10 h-10 rounded-xl bg-primary/10 text-primary mb-4">
                    <i className={`fas ${f.icon}`} />
                  </span>
                  <h4 className="font-bold text-foreground">{f.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team / Stats */}
        <section className="bg-slate-900 py-24 relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern-light opacity-20 pointer-events-none" />
          <div className="container mx-auto relative">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">The numbers that define us</h2>
              <p className="mt-4 text-slate-400">Growing faster every day with the support of our incredible community.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Active Sellers", value: "2.5K+", icon: "fa-users" },
                { label: "Completed Tasks", value: "18K+", icon: "fa-check-double" },
                { label: "Monthly Users", value: "50K+", icon: "fa-chart-line" },
                { label: "Cities Covered", value: "25+", icon: "fa-map-location-dot" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-white/5 text-primary-glow mb-4">
                    <i className={`fas ${s.icon} text-xl`} />
                  </div>
                  <div className="text-4xl font-black text-white">{s.value}</div>
                  <div className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto py-24">
          <div className="bg-gradient-brand rounded-[3rem] p-12 md:p-20 text-center text-primary-foreground shadow-glow relative overflow-hidden">
            <div className="absolute inset-0 grid-overlay opacity-20 pointer-events-none" />
            <div className="relative">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">Be part of the journey.</h2>
              <p className="mt-6 text-lg opacity-90 max-w-xl mx-auto">
                Join thousands of Sri Lankans who are changing the way they work and hire.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <Link to="/role-selection?mode=register" className="bg-white text-primary px-8 py-4 rounded-full font-bold shadow-soft hover:scale-105 transition">
                  Join as a Seller
                </Link>
                <Link to="/register/buyer" className="bg-primary-foreground/20 backdrop-blur border border-white/20 text-white px-8 py-4 rounded-full font-bold hover:bg-white/30 transition">
                  Sign up as a Buyer
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
