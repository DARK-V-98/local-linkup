import { useState } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "@/lib/usePageTitle";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import { toast } from "sonner";

const PACKAGES = [
  {
    id: "basic",
    icon: "fa-video",
    name: "Home Watch",
    price: "Rs. 2,500",
    period: "/ month",
    usd: "~$8 USD",
    color: "from-sky-500 to-blue-600",
    popular: false,
    features: [
      "Monthly video inspection walk-through",
      "Timestamped + geotagged footage",
      "WhatsApp delivery to your phone",
      "Written condition summary report",
      "Alert on visible damage or issues",
    ],
  },
  {
    id: "pro",
    icon: "fa-house-circle-check",
    name: "Property Pro",
    price: "Rs. 8,500",
    period: "/ month",
    usd: "~$28 USD",
    color: "from-violet-500 to-purple-600",
    popular: true,
    features: [
      "Everything in Home Watch",
      "Monthly utility bill payments",
      "Garden & exterior maintenance",
      "Key holder & access management",
      "Emergency response coordination",
      "Quarterly deep-clean scheduling",
    ],
  },
  {
    id: "full",
    icon: "fa-building-shield",
    name: "Full Management",
    price: "Rs. 18,000",
    period: "/ month",
    usd: "~$60 USD",
    color: "from-amber-500 to-orange-600",
    popular: false,
    features: [
      "Everything in Property Pro",
      "Dedicated property manager",
      "Rental management support",
      "All repairs coordinated",
      "Bi-monthly video reports",
      "24/7 emergency response",
      "Yearly property assessment",
    ],
  },
  {
    id: "family",
    icon: "fa-people-roof",
    name: "Family Care",
    price: "Rs. 6,500",
    period: "/ month",
    usd: "~$22 USD",
    color: "from-rose-500 to-pink-600",
    popular: false,
    features: [
      "Elderly parent welfare check-ins",
      "Monthly video visit report",
      "Medical appointment coordination",
      "Emergency family contact protocol",
      "Medication reminder system",
      "WhatsApp family group updates",
    ],
  },
];

const HOW_IT_WORKS = [
  { step: 1, icon: "fa-file-signature", color: "from-blue-500 to-indigo-600", title: "You Enroll Online", desc: "Fill in your property or family details. Takes 5 minutes. We assign a verified local agent to your account." },
  { step: 2, icon: "fa-user-check", color: "from-violet-500 to-purple-600", title: "Your Agent Gets to Work", desc: "Your dedicated Needly agent visits monthly, records everything, pays bills, and coordinates all necessary services." },
  { step: 3, icon: "fa-mobile-screen", color: "from-emerald-500 to-teal-600", title: "You Stay Informed", desc: "Receive monthly video reports, condition summaries, and instant WhatsApp alerts — straight to your phone wherever you are in the world." },
];

const COUNTRIES = [
  { flag: "🇦🇪", name: "UAE", city: "Dubai / Abu Dhabi" },
  { flag: "🇬🇧", name: "UK", city: "London / Manchester" },
  { flag: "🇦🇺", name: "Australia", city: "Melbourne / Sydney" },
  { flag: "🇨🇦", name: "Canada", city: "Toronto / Vancouver" },
  { flag: "🇮🇹", name: "Italy", city: "Rome / Milan" },
  { flag: "🇶🇦", name: "Qatar", city: "Doha" },
];

export default function Overseas() {
  usePageTitle("Overseas Sri Lankans — Property & Family Care");
  const [selected, setSelected] = useState("pro");
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "", propertyDistrict: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) { toast.error("Name and phone are required."); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Enquiry received! Our team will WhatsApp you within 24 hours.");
      setForm({ name: "", email: "", phone: "", country: "", propertyDistrict: "", message: "" });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="pt-20">

        {/* Hero */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-hero">
          <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 blur-3xl rounded-full animate-morph" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-secondary/10 blur-3xl rounded-full animate-morph" style={{ animationDelay: "-5s" }} />
          <div className="container mx-auto px-4 relative text-center max-w-4xl">
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {COUNTRIES.map((c) => (
                <span key={c.name} className="inline-flex items-center gap-1.5 bg-background/70 backdrop-blur border border-border rounded-full px-3 py-1 text-xs font-semibold">
                  {c.flag} {c.name}
                </span>
              ))}
            </div>
            <span className="inline-flex items-center gap-2 bg-foreground/5 rounded-full px-4 py-1.5 text-xs font-bold text-foreground/70 mb-4">
              <i className="fas fa-globe text-primary" /> For Overseas Sri Lankans
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1] mt-3">
              Your home. Your family.<br />
              <span className="text-gradient-brand">Our responsibility.</span>
            </h1>
            <p className="mt-6 text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
              We're your trusted eyes and hands in Sri Lanka. Monthly video reports, bill payments, property care, and family welfare — all managed by verified local agents, delivered straight to your WhatsApp.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <a href="#packages" className="bg-gradient-brand text-primary-foreground px-8 py-4 rounded-2xl font-bold text-base shadow-glow hover:scale-105 transition">
                View Packages
              </a>
              <a
                href="https://wa.me/94771234567?text=Hi%20Needly!%20I'm%20an%20overseas%20Sri%20Lankan%20and%20I'm%20interested%20in%20your%20property%20management%20service."
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-[#20ba5a] transition"
              >
                <i className="fab fa-whatsapp text-xl" /> WhatsApp Us
              </a>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <div className="bg-slate-900 py-6">
          <div className="container mx-auto px-4 flex flex-wrap justify-center gap-8 text-white text-sm font-semibold">
            {[
              { icon: "fa-video", text: "Timestamped HD videos" },
              { icon: "fa-shield-halved", text: "Verified local agents" },
              { icon: "fa-whatsapp fab", text: "WhatsApp delivery" },
              { icon: "fa-clock", text: "Monthly reports" },
              { icon: "fa-globe", text: "Island-wide coverage" },
            ].map((t) => (
              <span key={t.text} className="flex items-center gap-2">
                <i className={`${t.icon} text-primary`} /> {t.text}
              </span>
            ))}
          </div>
        </div>

        {/* How it works */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-foreground/5 rounded-full px-4 py-1.5 text-xs font-bold text-foreground/70">
              <i className="fas fa-route text-primary" /> How it works
            </span>
            <h2 className="mt-4 text-3xl md:text-5xl font-black tracking-tight">Peace of mind in 3 steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-14 left-[17%] right-[17%] border-t-2 border-dashed border-foreground/10" />
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="bg-card border border-border rounded-3xl p-8 text-center hover:shadow-glass transition">
                <span className={`grid place-items-center w-20 h-20 rounded-3xl bg-gradient-to-br ${s.color} text-white shadow-glow mx-auto mb-5 relative`}>
                  <i className={`fas ${s.icon} text-2xl`} />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-foreground text-background text-xs font-black grid place-items-center">{s.step}</span>
                </span>
                <h3 className="text-lg font-black mb-3">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Packages */}
        <section id="packages" className="bg-gradient-to-b from-background to-slate-50/50 border-y border-border py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">Choose your plan</h2>
              <p className="mt-3 text-muted-foreground">All prices in Sri Lankan Rupees. Cancel anytime.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelected(pkg.id)}
                  className={`relative bg-card border-2 rounded-3xl p-6 cursor-pointer transition hover:-translate-y-1 hover:shadow-glass
                    ${selected === pkg.id ? "border-primary shadow-glass" : "border-border"}
                    ${pkg.popular ? "ring-2 ring-primary ring-offset-2" : ""}`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black px-4 py-1 rounded-full whitespace-nowrap">
                      Most Popular
                    </span>
                  )}
                  <span className={`grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br ${pkg.color} text-white shadow-glow mb-4`}>
                    <i className={`fas ${pkg.icon} text-xl`} />
                  </span>
                  <h3 className="font-black text-lg">{pkg.name}</h3>
                  <div className="mt-2">
                    <span className="text-2xl font-black">{pkg.price}</span>
                    <span className="text-muted-foreground text-xs font-bold ml-1">{pkg.period}</span>
                    <div className="text-[11px] text-muted-foreground font-semibold">{pkg.usd}</div>
                  </div>
                  <ul className="mt-5 space-y-2.5">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <i className="fas fa-check text-primary mt-0.5 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  {selected === pkg.id && (
                    <div className="mt-5 flex items-center justify-center gap-1.5 text-xs font-bold text-primary">
                      <i className="fas fa-circle-check" /> Selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enquiry form + trust */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Form */}
            <div>
              <h2 className="text-3xl font-black mb-2">Get started today</h2>
              <p className="text-muted-foreground mb-8">Leave your details and we'll WhatsApp you within 24 hours. No contracts, cancel anytime.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground">Your Name *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name"
                      className="mt-1 w-full bg-background border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground">WhatsApp Number *</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+971 XX XXX XXXX"
                      className="mt-1 w-full bg-background border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground">Your Country</label>
                    <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="mt-1 w-full bg-background border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground">Property District (Sri Lanka)</label>
                    <input value={form.propertyDistrict} onChange={(e) => setForm({ ...form, propertyDistrict: e.target.value })} placeholder="e.g. Colombo, Kandy"
                      className="mt-1 w-full bg-background border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Selected Plan</label>
                  <div className="mt-1 w-full bg-primary/5 border border-primary/20 rounded-2xl px-5 py-3 text-sm font-bold text-primary">
                    {PACKAGES.find((p) => p.id === selected)?.name} — {PACKAGES.find((p) => p.id === selected)?.price}/month
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">Message (optional)</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your property or family situation..."
                    rows={3} className="mt-1 w-full bg-background border border-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full bg-gradient-brand text-primary-foreground py-4 rounded-2xl font-bold shadow-glow hover:scale-[1.02] transition disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2">
                  {submitting ? <><i className="fas fa-spinner fa-spin" /> Sending...</> : <><i className="fas fa-paper-plane" /> Send Enquiry</>}
                </button>
                <a href="https://wa.me/94771234567?text=Hi%20Needly!%20I'm%20interested%20in%20your%20Overseas%20service."
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-[#20ba5a] transition">
                  <i className="fab fa-whatsapp text-lg" /> Or WhatsApp Us Directly
                </a>
              </form>
            </div>

            {/* Why choose us */}
            <div className="space-y-5">
              <h3 className="text-2xl font-black">Why overseas Sri Lankans trust us</h3>
              {[
                { icon: "fa-video", title: "HD Video Reports", desc: "Every inspection is recorded in HD, timestamped, and geotagged. You see exactly what your agent sees." },
                { icon: "fa-user-shield", title: "Background-Checked Agents", desc: "All property agents pass ID verification, background checks, and in-person training before assignment." },
                { icon: "fa-whatsapp fab", title: "WhatsApp-First Communication", desc: "We don't send emails you forget to check. Everything comes to your WhatsApp — instantly, clearly." },
                { icon: "fa-rupee-sign", title: "Pay in Local Currency", desc: "Pay in Sri Lankan Rupees from overseas via bank transfer, card, or PayHere. No USD conversion needed." },
                { icon: "fa-headset", title: "Human Support Team", desc: "A real person is always available. Not a bot. If there's a problem, a human fixes it — same day." },
                { icon: "fa-shield-halved", title: "Needly Guarantee", desc: "If we don't deliver your monthly report on time, the month is free. No excuses, no delays." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-5 bg-card border border-border rounded-2xl hover:border-primary/30 transition">
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary shrink-0">
                    <i className={`${item.icon} text-lg`} />
                  </span>
                  <div>
                    <div className="font-black text-sm">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <MobileNav />
      <WhatsAppButton />
    </div>
  );
}
