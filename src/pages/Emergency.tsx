import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import { SL_DISTRICTS } from "@/data/mock";
import { addBooking, generateId } from "@/lib/store";
import { toast } from "sonner";

const EMERGENCY_TYPES = [
  { id: "roof", icon: "fa-house-crack", label: "Roof Leak", desc: "Emergency roof repair and waterproofing", price: 8500, surge: "1.5×", color: "from-red-500 to-rose-600" },
  { id: "electric", icon: "fa-bolt", label: "Electrical Fault", desc: "Power outage, short circuit, emergency wiring", price: 5500, surge: "1.5×", color: "from-amber-500 to-yellow-600" },
  { id: "plumbing", icon: "fa-faucet-drip", label: "Plumbing Burst", desc: "Pipe burst, major leak, drain blockage", price: 4500, surge: "1.5×", color: "from-blue-500 to-indigo-600" },
  { id: "flood", icon: "fa-water", label: "Flood Support", desc: "Water removal, property protection, logistics", price: 12000, surge: "2×", color: "from-cyan-500 to-teal-600" },
  { id: "medicine", icon: "fa-kit-medical", label: "Medicine Delivery", desc: "Emergency medication delivery to your door", price: 1500, surge: "1×", color: "from-emerald-500 to-green-600" },
  { id: "lockout", icon: "fa-lock-open", label: "Lockout / Keys", desc: "Locked out of home or car, key replacement", price: 3500, surge: "1.5×", color: "from-violet-500 to-purple-600" },
];

const NEARBY_VENDORS = [
  { name: "Sunil Perera", initial: "S", service: "Electrician", eta: "12 min", rating: 4.9, jobs: 234, verified: true },
  { name: "Ravi Kumar", initial: "R", service: "Plumber", eta: "18 min", rating: 4.8, jobs: 187, verified: true },
  { name: "Asith Jayasinghe", initial: "A", service: "Handyman", eta: "22 min", rating: 4.7, jobs: 98, verified: false },
];

export default function Emergency() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("Colombo");
  const [address, setAddress] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const emergency = EMERGENCY_TYPES.find((e) => e.id === selected);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !name || !phone || !address) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const bookingId = generateId("EM");
      addBooking({
        id: bookingId,
        serviceId: selected,
        serviceTitle: `EMERGENCY: ${emergency?.label}`,
        category: "Emergency",
        categoryIcon: `fas ${emergency?.icon ?? "fa-triangle-exclamation"}`,
        vendorName: NEARBY_VENDORS[0].name,
        vendorPhone: "+94771234567",
        vendorInitial: NEARBY_VENDORS[0].initial,
        vendorVerified: true,
        customerName: name,
        customerPhone: phone,
        date: new Date().toLocaleDateString("en-CA"),
        time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        notes: details,
        extraData: { "Address": address },
        price: emergency?.price ?? 5000,
        district,
        status: "confirmed",
        createdAt: new Date().toISOString(),
        isEmergency: true,
      });
      setSubmitting(false);
      setDispatched(true);
    }, 2000);
  };

  if (dispatched) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full">
          <div className="w-24 h-24 rounded-full bg-red-500 text-white grid place-items-center mx-auto mb-6 shadow-glow">
            <i className="fas fa-truck-fast text-4xl" />
          </div>
          <h1 className="text-3xl font-black mb-2">Help is on the way!</h1>
          <p className="text-muted-foreground mb-8">
            <strong className="text-foreground">{NEARBY_VENDORS[0].name}</strong> has been dispatched and will arrive in approximately <strong className="text-primary">12–18 minutes</strong>.
          </p>

          <div className="bg-card border border-border rounded-3xl p-6 mb-6 text-left space-y-4">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-brand text-primary-foreground font-black text-lg shrink-0">
                {NEARBY_VENDORS[0].initial}
              </span>
              <div>
                <div className="font-black">{NEARBY_VENDORS[0].name}</div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <i className="fas fa-shield-halved text-primary text-[9px]" /> Verified
                  <span className="mx-1">·</span>
                  <i className="fas fa-star text-amber-400 text-[9px]" /> {NEARBY_VENDORS[0].rating}
                  <span className="mx-1">·</span>
                  {NEARBY_VENDORS[0].jobs} jobs
                </div>
              </div>
              <a
                href={`https://wa.me/94771234567?text=Hi, I'm at ${address}. I have a ${emergency?.label} emergency.`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 bg-[#25D366] text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                <i className="fab fa-whatsapp" /> Chat
              </a>
            </div>

            <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-2xl">
              <i className="fas fa-clock text-amber-500" />
              <div>
                <div className="text-sm font-bold">ETA: 12–18 minutes</div>
                <div className="text-xs text-muted-foreground">Tracking available via WhatsApp</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="https://wa.me/94771234567?text=Emergency+support+needed"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 rounded-2xl font-bold"
            >
              <i className="fab fa-whatsapp text-xl" /> WhatsApp Needly Support
            </a>
            <Link to="/" className="text-sm font-bold text-muted-foreground hover:text-primary transition">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="pt-20">
        {/* Emergency hero */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-10 relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern-light opacity-20" />
          <div className="container mx-auto px-4 relative text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-bold mb-4">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Emergency Response Active
            </div>
            <h1 className="text-3xl md:text-5xl font-black">Emergency Services</h1>
            <p className="mt-3 text-red-100 max-w-xl mx-auto">
              Verified professionals dispatched within 15–30 minutes across Sri Lanka. Available 24/7.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm font-semibold">
              <span className="flex items-center gap-1.5"><i className="fas fa-clock" /> 15–30 min response</span>
              <span className="flex items-center gap-1.5"><i className="fas fa-shield-halved" /> Verified pros only</span>
              <span className="flex items-center gap-1.5"><i className="fas fa-whatsapp fab" /> Real-time WhatsApp updates</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          {/* Important notice */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
            <i className="fas fa-triangle-exclamation text-red-500 text-xl shrink-0 mt-0.5" />
            <div>
              <div className="font-black text-red-800 text-sm">Life-threatening emergency?</div>
              <p className="text-xs text-red-600 mt-0.5">
                Call <strong>119</strong> (Police), <strong>110</strong> (Fire & Rescue), or <strong>1990</strong> (Suwa Seriya ambulance) immediately.
                Needly Emergency is for property & logistics emergencies only.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-10">
            {/* Emergency type selection */}
            <div className="lg:col-span-3">
              <h2 className="text-xl font-black mb-5">What's the emergency?</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {EMERGENCY_TYPES.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setSelected(e.id)}
                    className={`text-left p-5 rounded-3xl border-2 transition hover:-translate-y-0.5
                      ${selected === e.id ? "border-red-500 bg-red-50" : "border-border bg-card hover:border-red-300"}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${e.color} text-white grid place-items-center mb-3`}>
                      <i className={`fas ${e.icon} text-xl`} />
                    </div>
                    <div className="font-black text-sm">{e.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{e.desc}</div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-bold">From Rs. {e.price.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        Surge {e.surge}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Nearby vendors preview */}
              <div className="bg-card border border-border rounded-3xl p-6">
                <h3 className="font-black mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Available Responders Near You
                </h3>
                <div className="space-y-3">
                  {NEARBY_VENDORS.map((v, i) => (
                    <div key={v.name} className="flex items-center gap-3 p-3 bg-foreground/5 rounded-2xl">
                      <span className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-brand text-primary-foreground font-black shrink-0">
                        {v.initial}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-sm">
                          {v.name}
                          {v.verified && <i className="fas fa-shield-halved text-primary text-[9px]" />}
                        </div>
                        <div className="text-xs text-muted-foreground">{v.service} · <i className="fas fa-star text-amber-400 text-[9px]" /> {v.rating} · {v.jobs} jobs</div>
                      </div>
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full shrink-0">{v.eta}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking form */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <form onSubmit={handleSubmit} className="bg-card border-2 border-red-100 rounded-3xl p-6 shadow-glass">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="w-8 h-8 rounded-xl bg-red-500 text-white grid place-items-center shrink-0">
                      <i className="fas fa-triangle-exclamation text-sm" />
                    </span>
                    <h3 className="font-black text-base">
                      {emergency ? `${emergency.label} Request` : "Select emergency type"}
                    </h3>
                  </div>

                  {emergency && (
                    <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-2xl text-sm">
                      <div className="flex justify-between font-bold">
                        <span>Emergency Rate</span>
                        <span className="text-red-600">Rs. {emergency.price.toLocaleString()}+</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">Surge pricing ({emergency.surge}) applies. Final cost confirmed by vendor.</div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">Your Name *</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
                        className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">WhatsApp / Phone *</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+94 7XX XXX XXX" type="tel"
                        className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">Your District *</label>
                      <select value={district} onChange={(e) => setDistrict(e.target.value)}
                        className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                        {SL_DISTRICTS.filter((d) => d !== "All Districts" && d !== "Online").map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">Address / Location *</label>
                      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address or landmark"
                        className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">Emergency Details</label>
                      <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Describe the situation..."
                        rows={3} className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !selected}
                    className="mt-5 w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-4 rounded-2xl font-black text-base shadow-lg hover:scale-[1.02] transition disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><i className="fas fa-spinner fa-spin" /> Dispatching...</>
                    ) : (
                      <><i className="fas fa-truck-fast" /> Dispatch Emergency Help</>
                    )}
                  </button>
                  <p className="text-center text-xs text-muted-foreground mt-2">Average response: 15–30 minutes</p>
                </form>

                <a
                  href="https://wa.me/94771234567?text=Emergency+help+needed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-[#20ba5a] transition"
                >
                  <i className="fab fa-whatsapp text-lg" /> Or WhatsApp Us Directly
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
