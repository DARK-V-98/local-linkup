import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Successfully subscribed to our newsletter!");
    setEmail("");
  };

  return (
    <footer className="relative bg-slate-900 text-slate-300 mt-20 md:mt-32">
      {/* Background patterns */}
      <div className="absolute inset-0 dot-pattern-light opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container mx-auto relative pt-16 pb-12">
        {/* Upper Footer: Newsletter & Logo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-start">
          <div className="lg:col-span-5">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img 
                src="/logo.png" 
                alt="Needlyy" 
                className="h-14 md:h-16 w-auto object-contain" 
              />
            </Link>
            <p className="text-base text-slate-400 max-w-sm leading-relaxed mb-8">
              Sri Lanka's premier marketplace connecting discerning buyers with verified local professionals across every industry. Quality, trust, and transparency.
            </p>
            <div className="flex gap-4">
              {[
                { icon: "fa-facebook-f", href: "https://facebook.com/needlyy" },
                { icon: "fa-instagram", href: "https://instagram.com/needlyy" },
                { icon: "fa-x-twitter", href: "https://twitter.com/needlyy" },
                { icon: "fa-linkedin-in", href: "https://linkedin.com/company/needlyy" }
              ].map((s, i) => (
                <a 
                  key={i} 
                  href={s.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="grid place-items-center w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
                >
                  <i className={`fab ${s.icon} text-sm transition-transform group-hover:scale-110`} />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-colors duration-500" />
              
              <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-white mb-2">Join our newsletter</h3>
                  <p className="text-sm text-slate-400">Get updates on new services and exclusive local deals.</p>
                </div>
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/10 text-white placeholder:text-slate-500 h-12 rounded-xl focus-visible:ring-primary"
                  />
                  <Button type="submit" className="bg-gradient-brand hover:scale-105 transition-transform h-12 rounded-xl px-6 font-bold">
                    Join
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Footer: Links */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 mb-16 border-t border-white/5 pt-16">
          {[
            { 
              title: "Marketplace", 
              links: [
                { label: "Browse Services", to: "/browse" },
                { label: "Top Professionals", to: "/browse?sort=rating" },
                { label: "New Services", to: "/browse?sort=newest" },
                { label: "How it Works", to: "/#how-it-works" }
              ] 
            },
            { 
              title: "Support", 
              links: [
                { label: "Help Center", to: "/contact" },
                { label: "Safety Center", to: "/terms" },
                { label: "Contact Support", to: "/contact" },
                { label: "Community Guidelines", to: "/terms" }
              ] 
            },
            { 
              title: "Company", 
              links: [
                { label: "About Us", to: "/about" },
                { label: "Careers", to: "/contact" },
                { label: "Press & Media", to: "/contact" },
                { label: "Partnerships", to: "/contact" }
              ] 
            },
            { 
              title: "Legal", 
              links: [
                { label: "Terms of Service", to: "/terms" },
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Cookie Policy", to: "/privacy" },
                { label: "Intellectual Property", to: "/terms" }
              ] 
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">{col.title}</h4>
              <ul className="space-y-4 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="hover:text-primary transition-colors duration-200 inline-flex items-center group">
                      <span className="w-0 group-hover:w-2 h-px bg-primary mr-0 group-hover:mr-2 transition-all duration-200" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Lower Footer: Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} Needlyy Sri Lanka.</span>
            <div className="flex gap-4">
              <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-tighter text-slate-600 font-bold">Trusted locally in</span>
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-full">
              <span className="text-sm">🇱🇰</span>
              <span className="text-xs font-bold text-slate-400">Sri Lanka</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
