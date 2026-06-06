import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import { MOCK_TOP_SERVICES, MOCK_LATEST_SERVICES, MOCK_REVIEWS } from "@/data/mock";
import { formatPrice, timeAgo } from "@/lib/format";
import { addBooking, generateId } from "@/lib/store";
import { addNotification } from "@/components/NotificationsDropdown";
import { toast } from "sonner";
import { usePageTitle } from "@/lib/usePageTitle";
import { getSaved, toggleSaved } from "@/lib/saved";

const allServices = [...MOCK_TOP_SERVICES, ...MOCK_LATEST_SERVICES];

const BOOKING_EXTRA_FIELDS: Record<string, { label: string; placeholder: string }[]> = {
  "Vehicle Service": [
    { label: "Vehicle Make & Model", placeholder: "e.g. Toyota Aqua 2018" },
    { label: "Registration Number", placeholder: "e.g. CAB-1234" },
  ],
  "Delivery": [
    { label: "Pickup Address", placeholder: "Full pickup address" },
    { label: "Delivery Address", placeholder: "Full delivery address" },
    { label: "Item Description", placeholder: "What needs to be delivered?" },
  ],
  "Home Services": [
    { label: "Home Address", placeholder: "Your full address" },
  ],
  "Repairs": [
    { label: "Home Address", placeholder: "Your full address" },
    { label: "Problem Description", placeholder: "Describe the issue in detail" },
  ],
  "Technology": [
    { label: "Project Brief", placeholder: "Describe what you need built" },
    { label: "Target Deadline", placeholder: "e.g. 2 weeks, 1 month" },
  ],
  "Education": [
    { label: "Student Level / Grade", placeholder: "e.g. Grade 10, A/L, Degree" },
    { label: "Specific Topics Needed", placeholder: "Topics you need help with" },
  ],
  "Tuition": [
    { label: "Student Level / Grade", placeholder: "e.g. Grade 10, A/L, Degree" },
    { label: "Subjects Needed", placeholder: "e.g. Physics, Chemistry" },
  ],
  "Ayurveda Service": [
    { label: "Health Concern (Optional)", placeholder: "e.g. Back pain, stress relief" },
  ],
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <i
          key={i}
          className={`fas fa-star text-xs ${i <= Math.floor(rating) ? "text-amber-400" : i - 0.5 <= rating ? "text-amber-300" : "text-slate-200"}`}
        />
      ))}
    </span>
  );
}

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const service = allServices.find((s) => s.id === id);

  usePageTitle(
    service ? `${service.title} by ${service.seller}` : "Service Detail",
    service ? `Book ${service.title} by ${service.seller} on Needlyy. Starting from ${service.price > 0 ? `Rs. ${service.price.toLocaleString()}` : "negotiable"}. Verified seller in ${service.location}.` : undefined
  );

  const [saved, setSaved] = useState(() => service ? getSaved().includes(service.id) : false);

  const handleSave = () => {
    if (!service) return;
    const isNowSaved = toggleSaved(service.id);
    setSaved(isNowSaved);
    toast.success(isNowSaved ? "Saved! Find it in your Saved Sellers." : "Removed from saved.");
  };

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <i className="fas fa-magnifying-glass text-5xl text-muted-foreground" />
        <h2 className="text-2xl font-black">Service not found</h2>
        <Link to="/browse" className="text-primary font-semibold hover:underline">Browse all services</Link>
      </div>
    );
  }

  const reviews = MOCK_REVIEWS.filter((r) => r.serviceId === service.id);
  const extraFields = BOOKING_EXTRA_FIELDS[service.category] ?? [];
  const related = allServices.filter((s) => s.category === service.category && s.id !== service.id).slice(0, 3);

  const SL_PHONE_RE = /^(\+94|094|0)[0-9]{9}$/;

  const validateAndConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Please enter your name."); return; }
    if (!phone.trim() || !SL_PHONE_RE.test(phone.replace(/\s/g, ""))) {
      toast.error("Enter a valid Sri Lankan number, e.g. +94 77 123 4567");
      return;
    }
    if (!date) { toast.error("Please choose a preferred date."); return; }
    if (!agreed) { toast.error("Please agree to the booking terms."); return; }
    setShowConfirm(true);
  };

  const handleBooking = () => {
    setShowConfirm(false);
    setSubmitting(true);
    setTimeout(() => {
      const bookingId = generateId("BK");
      addBooking({
        id: bookingId,
        serviceId: service.id,
        serviceTitle: service.title,
        category: service.category,
        categoryIcon: service.categoryIcon,
        vendorName: service.seller,
        vendorPhone: service.sellerPhone ?? "+94771234567",
        vendorInitial: service.sellerInitial,
        vendorVerified: service.sellerVerified ?? false,
        customerName: name,
        customerPhone: phone,
        date,
        time,
        notes,
        extraData: extras,
        price: service.price,
        district: service.district,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      addNotification({
        type: "booking_new",
        title: "Booking Request Sent",
        body: `Your request for "${service.title}" has been sent to ${service.seller}.`,
        link: `/booking/confirm/${bookingId}`,
      });
      setSubmitting(false);
      navigate(`/booking/confirm/${bookingId}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
            <Link to="/" className="hover:text-primary transition">Home</Link>
            <i className="fas fa-chevron-right text-[10px]" />
            <Link to="/browse" className="hover:text-primary transition">Browse</Link>
            <i className="fas fa-chevron-right text-[10px]" />
            <button onClick={() => navigate(`/browse?category=${service.category}`)} className="hover:text-primary transition">{service.category}</button>
            <i className="fas fa-chevron-right text-[10px]" />
            <span className="text-foreground line-clamp-1 max-w-[200px]">{service.title}</span>
          </nav>
        </div>

        <div className="container mx-auto px-4 py-4 grid lg:grid-cols-3 gap-10">
          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service header card */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
              <div className="relative h-52 md:h-72 bg-slate-100 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
                <i className={`fas ${service.categoryIcon} text-[9rem] text-slate-200`} />
                {service.badge && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-slate-900/90 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                    <i className={`${service.badgeIcon} text-amber-400`} /> {service.badge}
                  </span>
                )}
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 bg-background/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold">
                  <i className="fas fa-tag text-primary text-[10px]" /> {service.type}
                </span>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{service.category}</span>
                  <span className="bg-foreground/5 text-muted-foreground text-xs font-bold px-3 py-1 rounded-full">
                    <i className="fas fa-location-dot mr-1" />{service.location}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <h1 className="text-2xl md:text-3xl font-black leading-tight flex-1">{service.title}</h1>
                  <button
                    onClick={handleSave}
                    className={`w-10 h-10 rounded-full border grid place-items-center shrink-0 transition hover:scale-110 ${saved ? "text-rose-500 bg-rose-50 border-rose-200" : "text-muted-foreground bg-background border-border hover:border-rose-300 hover:text-rose-400"}`}
                    title={saved ? "Remove from saved" : "Save this service"}
                  >
                    <i className={`${saved ? "fas" : "far"} fa-heart text-sm`} />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <span className="flex items-center gap-1.5">
                    <StarRating rating={service.rating} />
                    <span className="font-bold text-sm">{service.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground text-xs">({service.reviews} reviews)</span>
                  </span>
                  <span className="text-muted-foreground text-xs font-semibold">
                    <i className="fas fa-clock mr-1" />Posted {timeAgo(service.postedAt)}
                  </span>
                </div>
                {service.tags && (
                  <div className="flex flex-wrap gap-2 mt-5">
                    {service.tags.map((tag) => (
                      <span key={tag} className="bg-foreground/5 border border-border text-xs font-semibold px-3 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* About this service */}
            <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
              <h2 className="text-lg font-black mb-4">About This Service</h2>
              <p className="text-muted-foreground leading-relaxed">{service.description ?? "No description provided."}</p>

              <h3 className="text-base font-black mt-7 mb-4">What's Included</h3>
              <ul className="space-y-2.5">
                {[
                  "Professional consultation before starting",
                  "High-quality service as described",
                  "Direct communication via WhatsApp",
                  "Post-service follow-up support",
                  service.type === "Fixed Price" ? "Fixed price — no hidden fees" : null,
                  service.type === "Online Service" ? "Zoom / Google Meet sessions" : null,
                  service.type === "Booking Service" ? "Flexible date scheduling" : null,
                ].filter(Boolean).map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="grid place-items-center w-5 h-5 rounded-full bg-primary/10 text-primary shrink-0 mt-0.5">
                      <i className="fas fa-check text-[10px]" />
                    </span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Seller profile */}
            <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
              <h2 className="text-lg font-black mb-5">About the Seller</h2>
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <span className="grid place-items-center w-16 h-16 rounded-2xl bg-gradient-brand text-primary-foreground text-2xl font-black">
                    {service.sellerInitial}
                  </span>
                  {service.sellerVerified && (
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground grid place-items-center" title="Verified Seller">
                      <i className="fas fa-check text-[10px]" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-lg">{service.seller}</span>
                    {service.sellerVerified && (
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                        <i className="fas fa-shield-halved text-[10px]" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{service.sellerBio}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground font-semibold">
                    <span><i className="fas fa-briefcase mr-1 text-primary" />{service.sellerJobs} jobs done</span>
                    <span><i className="fas fa-calendar mr-1 text-primary" />Member since {service.sellerMember}</span>
                    <span><i className="fas fa-location-dot mr-1 text-primary" />{service.location}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border text-center">
                <div>
                  <div className="text-xl font-black">{service.rating.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground font-semibold mt-0.5">Rating</div>
                </div>
                <div>
                  <div className="text-xl font-black">{service.reviews}</div>
                  <div className="text-xs text-muted-foreground font-semibold mt-0.5">Reviews</div>
                </div>
                <div>
                  <div className="text-xl font-black">{service.sellerJobs}</div>
                  <div className="text-xs text-muted-foreground font-semibold mt-0.5">Completed</div>
                </div>
              </div>

              {service.sellerPhone && (
                <a
                  href={`https://wa.me/${service.sellerPhone.replace(/\D/g, "")}?text=Hi, I found your service on Needly: ${service.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-2xl font-bold hover:bg-[#20ba5a] transition"
                >
                  <i className="fab fa-whatsapp text-lg" /> Chat on WhatsApp
                </a>
              )}
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-card border border-border rounded-3xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black">Customer Reviews</h2>
                  <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold">
                    <i className="fas fa-star text-amber-400" /> {service.rating.toFixed(1)} / 5.0
                  </span>
                </div>
                <div className="space-y-5">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-b border-border last:border-0 pb-5 last:pb-0">
                      <div className="flex items-start gap-3">
                        <span className="grid place-items-center w-9 h-9 rounded-full bg-gradient-brand text-primary-foreground text-sm font-black shrink-0">
                          {r.initial}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-sm">{r.author}</span>
                            <span className="text-xs text-muted-foreground">{timeAgo(r.date)}</span>
                          </div>
                          <StarRating rating={r.rating} />
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{r.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              {/* Price card */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-glass">
                <div className="flex items-end justify-between mb-1">
                  <div>
                    <span className="text-xs text-muted-foreground font-bold uppercase">Starting at</span>
                    <div className="text-3xl font-black mt-1">{formatPrice(service.price)}</div>
                    {service.priceUnit && (
                      <span className="text-xs text-muted-foreground">per {service.priceUnit}</span>
                    )}
                  </div>
                  <StarRating rating={service.rating} />
                </div>

                {/* Trust badges */}
                <div className="mt-5 space-y-2.5">
                  {[
                    { icon: "fa-shield-halved", text: "Secure booking — your data is protected" },
                    { icon: "fa-rotate-left", text: "Free to cancel up to 24hrs before" },
                    { icon: "fa-headset", text: "Needly support if anything goes wrong" },
                  ].map((b) => (
                    <div key={b.text} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                      <i className={`fas ${b.icon} text-primary mt-0.5 w-4 text-center`} />
                      <span>{b.text}</span>
                    </div>
                  ))}
                </div>

                <hr className="my-5 border-border" />

                {/* Confirmation modal */}
                {showConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-background border border-border rounded-3xl p-6 max-w-sm w-full shadow-glass">
                      <h3 className="font-black text-lg mb-2">Confirm Booking Request</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        You're requesting <strong>{service.title}</strong> from <strong>{service.seller}</strong> on <strong>{date}</strong>{time ? ` at ${time}` : ""}.
                      </p>
                      <div className="text-sm font-black text-foreground mb-5">{formatPrice(service.price)}</div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowConfirm(false)}
                          className="flex-1 py-3 rounded-2xl border border-border font-bold text-sm hover:bg-foreground/5 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleBooking}
                          className="flex-1 py-3 rounded-2xl bg-gradient-brand text-primary-foreground font-bold text-sm shadow-glow hover:scale-[1.02] transition"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              {/* Booking form */}
                <form onSubmit={validateAndConfirm} className="space-y-3">
                  <h3 className="font-black text-base">Request a Booking</h3>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground">Your Name</label>
                    <input
                      value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-muted-foreground">Phone / WhatsApp</label>
                    <input
                      value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 7XX XXX XXX"
                      type="tel"
                      className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">Preferred Date</label>
                      <input
                        value={date} onChange={(e) => setDate(e.target.value)}
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        className="mt-1 w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground">Preferred Time</label>
                      <input
                        value={time} onChange={(e) => setTime(e.target.value)}
                        type="time"
                        className="mt-1 w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {extraFields.map((f) => (
                    <div key={f.label}>
                      <label className="text-xs font-bold text-muted-foreground">{f.label}</label>
                      <input
                        value={extras[f.label] ?? ""}
                        onChange={(e) => setExtras((prev) => ({ ...prev, [f.label]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="text-xs font-bold text-muted-foreground">Additional Notes</label>
                    <textarea
                      value={notes} onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests or details..."
                      rows={3}
                      className="mt-1 w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 accent-primary w-4 h-4 shrink-0"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary font-semibold hover:underline" target="_blank">booking terms</Link>
                      {" "}and understand the cancellation policy.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-brand text-primary-foreground py-3.5 rounded-2xl font-bold shadow-glow hover:scale-[1.02] transition disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><i className="fas fa-spinner fa-spin" /> Sending Request...</>
                    ) : (
                      <><i className="fas fa-calendar-check" /> Request Booking</>
                    )}
                  </button>
                  <p className="text-center text-xs text-muted-foreground">The seller will confirm via WhatsApp</p>
                </form>
              </div>

              {/* Customer protection box */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 dot-pattern-light opacity-20" />
                <div className="relative">
                  <i className="fas fa-shield-halved text-primary text-3xl mb-3" />
                  <h4 className="font-bold text-base">Needly Protection</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Customer protection up to <strong className="text-white">Rs. 20,000</strong> for verified bookings.
                    If something goes wrong, our team is here to help.
                  </p>
                  <Link to="/about" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                    Learn more <i className="fas fa-arrow-right text-[10px]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related services */}
        {related.length > 0 && (
          <section className="container mx-auto px-4 py-12 border-t border-border mt-6">
            <h2 className="text-xl font-black mb-6">More {service.category} Services</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((s) => (
                <Link
                  key={s.id}
                  to={`/service/${s.id}`}
                  className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-glass hover:-translate-y-1 transition-all"
                >
                  <div className="relative h-32 bg-slate-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100" />
                    <i className={`fas ${s.categoryIcon} text-slate-200 text-[6rem] absolute -bottom-4 -right-3 group-hover:scale-110 transition`} />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm line-clamp-2">{s.title}</h3>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground font-semibold">{s.seller}</span>
                      <span className="font-black text-sm">{formatPrice(s.price)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
