import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      setLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-20">
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-hero">
          <div className="absolute inset-0 grid-overlay pointer-events-none opacity-40" />
          <div className="container mx-auto relative grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 bg-foreground/5 rounded-full px-4 py-1.5 text-xs font-bold text-foreground/70 mb-6">
                <i className="fas fa-headset text-primary" /> Get in touch
              </span>
              <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight">
                How can we <br />
                <span className="text-gradient-brand">help you?</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-md">
                Have a question about the platform, your account, or just want to say hi? We're here for you 24/7.
              </p>

              <div className="mt-12 space-y-6">
                {[
                  { icon: "fa-envelope", label: "Email support", val: "support@needlyy.lk" },
                  { icon: "fa-phone", label: "Call us", val: "+94 11 234 5678" },
                  { icon: "fa-location-dot", label: "Our office", val: "123 Galle Road, Colombo 03" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4 group">
                    <span className="grid place-items-center w-12 h-12 rounded-2xl bg-white border border-border shadow-soft group-hover:bg-primary group-hover:text-primary-foreground transition">
                      <i className={`fas ${item.icon}`} />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.label}</div>
                      <div className="text-foreground font-bold">{item.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-[3rem] animate-pulse-glow" />
              <div className="relative bg-background/80 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 md:p-12 shadow-glass">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold ml-1">Name</label>
                      <input required placeholder="Saman Perera" className="w-full bg-background border border-input rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-ring transition" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold ml-1">Email</label>
                      <input type="email" required placeholder="saman@email.com" className="w-full bg-background border border-input rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-ring transition" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Subject</label>
                    <select className="w-full bg-background border border-input rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-ring transition appearance-none">
                      <option>General Inquiry</option>
                      <option>Account Support</option>
                      <option>Payment Issue</option>
                      <option>Become a Partner</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold ml-1">Message</label>
                    <textarea required rows={5} placeholder="How can we help?" className="w-full bg-background border border-input rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-ring transition resize-none" />
                  </div>
                  <button
                    disabled={loading}
                    className="w-full bg-gradient-brand text-primary-foreground py-4 rounded-2xl font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-paper-plane" />}
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Map Placeholder */}
        <section className="container mx-auto mt-24">
          <div className="relative h-[400px] rounded-[3rem] bg-slate-200 overflow-hidden border border-border shadow-soft group">
            <div className="absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-10 transition pointer-events-none" />
            <div className="absolute inset-0 grid place-items-center bg-slate-100">
               <div className="text-center">
                  <i className="fas fa-map-marked-alt text-6xl text-slate-300 mb-4 animate-float" />
                  <div className="font-bold text-slate-400">Interactive Map Loading...</div>
               </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
