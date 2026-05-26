import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import { MOCK_TOP_SERVICES, MOCK_LATEST_SERVICES, MOCK_REVIEWS } from "@/data/mock";
import { formatPrice, timeAgo } from "@/lib/format";

const allServices = [...MOCK_TOP_SERVICES, ...MOCK_LATEST_SERVICES];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={`fas fa-star text-xs ${i <= Math.floor(rating) ? "text-amber-400" : "text-slate-200"}`} />
      ))}
    </span>
  );
}

export default function VendorProfile() {
  const { vendorSlug } = useParams<{ vendorSlug: string }>();
  const navigate = useNavigate();

  const vendorServices = allServices.filter(
    (s) => s.seller.toLowerCase().replace(/[^a-z0-9]/g, "-") === vendorSlug
  );
  const vendor = vendorServices[0];

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <i className="fas fa-user-slash text-5xl text-muted-foreground" />
        <h2 className="text-2xl font-black">Vendor not found</h2>
        <Link to="/browse" className="text-primary font-semibold hover:underline">Browse all services</Link>
      </div>
    );
  }

  const vendorReviews = MOCK_REVIEWS.filter((r) => vendorServices.some((s) => s.id === r.serviceId));
  const avgRating = vendorServices.reduce((a, s) => a + s.rating, 0) / vendorServices.length;
  const totalReviews = vendorServices.reduce((a, s) => a + s.reviews, 0);
  const whatsappMsg = encodeURIComponent(`Hi ${vendor.seller}, I found your profile on Needly and I'm interested in your services.`);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="pt-20">
        {/* Profile hero */}
        <div className="bg-gradient-hero border-b border-border py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />
          <div className="container mx-auto px-4 relative">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground font-semibold mb-8">
              <Link to="/" className="hover:text-primary transition">Home</Link>
              <i className="fas fa-chevron-right text-[10px]" />
              <Link to="/browse" className="hover:text-primary transition">Browse</Link>
              <i className="fas fa-chevron-right text-[10px]" />
              <span className="text-foreground">{vendor.seller}</span>
            </nav>

            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="relative shrink-0">
                <span className="grid place-items-center w-24 h-24 rounded-[2rem] bg-gradient-brand text-primary-foreground text-4xl font-black shadow-glow">
                  {vendor.sellerInitial}
                </span>
                {vendor.sellerVerified && (
                  <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground grid place-items-center shadow">
                    <i className="fas fa-check text-xs" />
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-black">{vendor.seller}</h1>
                  {vendor.sellerVerified && (
                    <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20">
                      <i className="fas fa-shield-halved text-[10px]" /> Verified Seller
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground mb-4">{vendor.sellerBio}</p>

                <div className="flex flex-wrap gap-5 text-sm">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <StarRating rating={avgRating} />
                    <span className="font-black">{avgRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">({totalReviews} reviews)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                    <i className="fas fa-briefcase text-primary text-xs" />
                    {vendor.sellerJobs} jobs completed
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                    <i className="fas fa-calendar text-primary text-xs" />
                    Member since {vendor.sellerMember}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                    <i className="fas fa-location-dot text-primary text-xs" />
                    {vendor.location}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                <a
                  href={`https://wa.me/${(vendor.sellerPhone ?? "").replace(/\D/g, "")}?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#20ba5a] transition"
                >
                  <i className="fab fa-whatsapp text-lg" /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 grid lg:grid-cols-3 gap-10">
          {/* Main: services + reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Services */}
            <div>
              <h2 className="text-xl font-black mb-5">Services by {vendor.seller}</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {vendorServices.map((s) => (
                  <Link
                    key={s.id}
                    to={`/service/${s.id}`}
                    className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-glass hover:-translate-y-1 transition-all"
                  >
                    <div className="relative h-36 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                      <i className={`fas ${s.categoryIcon} text-slate-200 text-[7rem] absolute -bottom-4 -right-4 group-hover:scale-110 transition`} />
                      <span className="absolute top-3 left-3 bg-white/95 text-foreground text-xs font-bold px-3 py-1 rounded-full">{s.category}</span>
                      <span className="absolute top-3 right-3 bg-foreground/30 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        <i className="fas fa-star text-amber-300 text-[9px] mr-1" />{s.rating}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm line-clamp-2">{s.title}</h3>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground font-semibold">{s.reviews} reviews</span>
                        <span className="font-black text-sm">{formatPrice(s.price)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {vendorReviews.length > 0 && (
              <div className="bg-card border border-border rounded-3xl p-6">
                <h2 className="text-xl font-black mb-6">Customer Reviews</h2>
                <div className="space-y-5">
                  {vendorReviews.map((r) => (
                    <div key={r.id} className="border-b border-border last:border-0 pb-5 last:pb-0">
                      <div className="flex items-start gap-3">
                        <span className="grid place-items-center w-9 h-9 rounded-full bg-gradient-brand text-primary-foreground text-sm font-black shrink-0">
                          {r.initial}
                        </span>
                        <div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="font-bold text-sm">{r.author}</span>
                            <span className="text-xs text-muted-foreground">{timeAgo(r.date)}</span>
                          </div>
                          <StarRating rating={r.rating} />
                          <p className="text-sm text-muted-foreground mt-2">{r.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Stats */}
            <div className="bg-card border border-border rounded-3xl p-6">
              <h3 className="font-black mb-5">Seller Stats</h3>
              <div className="space-y-4">
                {[
                  { label: "Average Rating", val: `${avgRating.toFixed(1)} / 5.0`, icon: "fa-star", color: "text-amber-500" },
                  { label: "Total Jobs", val: vendor.sellerJobs?.toString() ?? "–", icon: "fa-briefcase", color: "text-primary" },
                  { label: "Total Reviews", val: totalReviews.toString(), icon: "fa-comments", color: "text-violet-500" },
                  { label: "Services Listed", val: vendorServices.length.toString(), icon: "fa-list", color: "text-emerald-500" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
                      <i className={`fas ${s.icon} ${s.color} text-xs w-4 text-center`} />{s.label}
                    </span>
                    <span className="font-black text-sm">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust */}
            <div className="bg-card border border-border rounded-3xl p-6">
              <h3 className="font-black mb-4">Trust & Safety</h3>
              <div className="space-y-3">
                {[
                  { done: vendor.sellerVerified, label: "Identity Verified" },
                  { done: true, label: "Phone Verified" },
                  { done: vendor.sellerVerified, label: "Background Checked" },
                  { done: (vendor.sellerJobs ?? 0) > 10, label: "10+ Jobs Completed" },
                ].map((t) => (
                  <div key={t.label} className="flex items-center gap-2.5 text-sm">
                    <i className={`fas ${t.done ? "fa-circle-check text-emerald-500" : "fa-circle text-slate-300"} text-sm`} />
                    <span className={t.done ? "font-semibold" : "text-muted-foreground"}>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 dot-pattern-light opacity-20" />
              <div className="relative">
                <i className="fas fa-shield-halved text-primary text-2xl mb-3" />
                <h4 className="font-bold">Needly Protection</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">Covered up to Rs. 20,000 for all verified bookings.</p>
                <Link to={`/service/${vendorServices[0]?.id}`} className="mt-4 block text-center bg-gradient-brand text-primary-foreground py-3 rounded-2xl font-bold text-sm shadow-glow hover:scale-105 transition">
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
      <WhatsAppButton />
    </div>
  );
}
