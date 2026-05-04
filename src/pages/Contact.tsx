import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <main className="pt-20 pb-20">
        <section className="relative py-24 md:py-32 overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 dot-pattern-light opacity-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 blur-[120px] rounded-full -ml-48 -mb-48" />
          
          <div className="container mx-auto relative grid lg:grid-cols-2 gap-20 items-center px-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest mb-8 text-primary">
                <i className="fas fa-headset" /> Support Center
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8">
                How can we <br />
                <span className="text-gradient-brand">help you?</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-md leading-relaxed mb-12">
                Have a question about the platform, your account, or just want to say hi? Our team is standing by.
              </p>

              <div className="grid gap-6">
                {[
                  { icon: "fa-envelope", label: "Email Support", val: "support@needlyy.lk", color: "text-blue-400" },
                  { icon: "fa-phone", label: "Direct Line", val: "+94 11 234 5678", color: "text-emerald-400" },
                  { icon: "fa-location-dot", label: "Headquarters", val: "123 Galle Road, Colombo 03", color: "text-amber-400" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-5 group p-4 rounded-2xl hover:bg-white/5 transition-all">
                    <span className={`grid place-items-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 ${item.color} shadow-soft group-hover:scale-110 transition-transform`}>
                      <i className={`fas ${item.icon} text-xl`} />
                    </span>
                    <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</div>
                      <div className="text-white font-bold text-lg">{item.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full animate-pulse-glow" />
              <div className="relative bg-white text-slate-950 border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Name</label>
                      <Input required placeholder="Saman Perera" className="h-14 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-primary font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                      <Input type="email" required placeholder="saman@email.com" className="h-14 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-primary font-bold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                    <select className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary transition appearance-none font-bold">
                      <option>General Inquiry</option>
                      <option>Account Support</option>
                      <option>Payment Issue</option>
                      <option>Become a Partner</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message Details</label>
                    <Textarea required rows={5} placeholder="Tell us how we can help..." className="bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-primary font-bold resize-none" />
                  </div>
                  <Button
                    disabled={loading}
                    className="w-full h-16 bg-gradient-brand text-primary-foreground rounded-2xl font-black text-lg shadow-glow hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-3"
                  >
                    {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-paper-plane" />}
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Map Placeholder */}
        <section className="container mx-auto mt-32 px-4">
          <div className="relative h-[500px] rounded-[4rem] bg-slate-200 overflow-hidden border border-foreground/5 shadow-2xl group">
            <div className="absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-5 transition pointer-events-none" />
            <div className="absolute inset-0 grid place-items-center bg-[#f0f0f0]">
               <div className="text-center">
                  <div className="w-20 h-20 bg-white rounded-3xl grid place-items-center mx-auto mb-6 shadow-soft animate-float">
                    <i className="fas fa-map-location-dot text-3xl text-primary" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Colombo Headquarters</h3>
                  <p className="text-slate-500 mt-2 font-medium">Interactive map is loading...</p>
               </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
