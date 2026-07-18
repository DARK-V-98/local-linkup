import { useMemo } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { toast } from "sonner";
import { useSaved } from "@/hooks/useSaved";
import { useServices } from "@/hooks/useServices";
import { formatPrice } from "@/lib/format";

const buyerSidebarItems = [
  { label: "Overview", to: "/dashboard/buyer", icon: "fa-house-user" },
  { label: "My Bookings", to: "/dashboard/buyer/orders", icon: "fa-bag-shopping" },
  { label: "Saved Sellers", to: "/dashboard/buyer/saved", icon: "fa-heart" },
  { label: "Payment Methods", to: "/dashboard/buyer/payments", icon: "fa-credit-card" },
  { label: "Account Settings", to: "/dashboard/buyer/settings", icon: "fa-user-gear" },
];

interface SavedSeller {
  id: string;
  name: string;
  slug: string;
  category: string;
  categoryIcon: string;
  district: string;
  rating: number;
  reviews: number;
  orders: number;
  verified: boolean;
  topRated: boolean;
  price: string;
  savedAt: string;
  lastBooked?: string;
  bio: string;
  color: string;
}


const CARD_COLORS = [
  "from-violet-500 to-purple-600",
  "from-sky-500 to-blue-600",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
];

export default function SavedSellers() {
  const { savedIds, toggle, ready } = useSaved();
  const { services, loading } = useServices();

  // Saved entries are service ids; resolve each to the seller behind it.
  const saved: SavedSeller[] = useMemo(() => {
    const seen = new Set<string>();
    return services
      .filter((sv) => savedIds.has(sv.id))
      .filter((sv) => {
        const key = sv.sellerId ?? sv.seller;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((sv, i) => ({
        id: sv.id,
        name: sv.seller,
        slug: sv.seller.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        category: sv.category,
        categoryIcon: sv.categoryIcon,
        district: sv.district,
        rating: sv.rating,
        reviews: sv.reviews,
        orders: sv.sellerJobs ?? 0,
        verified: Boolean(sv.sellerVerified),
        topRated: sv.rating >= 4.8 && sv.reviews > 0,
        price: `From ${formatPrice(sv.price)}`,
        savedAt: "",
        bio: sv.sellerBio ?? sv.description ?? "",
        color: CARD_COLORS[i % CARD_COLORS.length],
      }));
  }, [services, savedIds]);

  const remove = async (id: string) => {
    await toggle(id);
    toast.success("Seller removed from saved list.");
  };

  return (
    <DashboardShell role="Buyer" sidebarItems={buyerSidebarItems}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Saved Sellers</h1>
          <p className="text-slate-500 font-medium mt-1">Your shortlist of trusted professionals.</p>
        </div>
        <Link to="/browse" className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-slate-800 transition">
          <i className="fas fa-magnifying-glass" /> Find More Pros
        </Link>
      </div>

      {loading || !ready ? (
        <div className="grid sm:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
          <i className="fas fa-heart text-5xl text-slate-200 mb-4 block" />
          <h3 className="text-lg font-black text-slate-400">No saved sellers yet</h3>
          <p className="text-sm text-slate-400 mt-1 mb-6">Browse services and tap the heart icon to save a seller.</p>
          <Link to="/browse" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition">
            <i className="fas fa-magnifying-glass" /> Browse Services
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-400 mb-5">{saved.length} seller{saved.length !== 1 ? "s" : ""} saved</p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {saved.map((seller) => (
              <div key={seller.id} className="bg-white rounded-3xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-soft transition flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${seller.color} text-white grid place-items-center text-xl font-black shadow-soft shrink-0`}>
                    {seller.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-slate-900 text-sm">{seller.name}</span>
                      {seller.verified && <i className="fas fa-circle-check text-emerald-500 text-xs" title="Verified" />}
                      {seller.topRated && (
                        <span className="text-[9px] font-black bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full">Top Rated</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{seller.category} · {seller.district}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-amber-500"><i className="fas fa-star text-[10px] mr-0.5" />{seller.rating}</span>
                      <span className="text-[11px] text-slate-400">({seller.reviews} reviews)</span>
                      <span className="text-[11px] text-slate-400">· {seller.orders} orders</span>
                    </div>
                  </div>
                  <button onClick={() => remove(seller.id)} className="w-8 h-8 rounded-full bg-rose-50 text-rose-400 hover:bg-rose-100 transition grid place-items-center shrink-0" title="Remove">
                    <i className="fas fa-heart-crack text-xs" />
                  </button>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{seller.bio}</p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span><i className="fas fa-coins text-primary mr-1" />{seller.price}</span>
                  <span><i className="fas fa-location-dot text-slate-400 mr-1" />{seller.district}</span>
                </div>

                {seller.lastBooked && (
                  <div className="bg-slate-50 rounded-xl px-3 py-2 text-[11px] text-slate-500 font-semibold">
                    <i className="fas fa-rotate-right text-primary mr-1.5" />Last booked {seller.lastBooked}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-1">
                  <Link
                    to={`/vendor/${seller.slug}`}
                    className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition"
                  >
                    <i className="fas fa-user mr-1" /> View Profile
                  </Link>
                  <Link
                    to="/browse"
                    className="flex-1 text-center py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                  >
                    <i className="fas fa-calendar-plus mr-1" /> Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Suggested section */}
          <div className="mt-10">
            <h3 className="font-black text-slate-900 mb-1">You might also like</h3>
            <p className="text-xs text-slate-400 mb-4">Based on your saved sellers and booking history.</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { name: "Ravi M.", category: "AC Technician", district: "Colombo", rating: 4.8, color: "from-cyan-500 to-blue-500" },
                { name: "Amila N.", category: "Electrician", district: "Kandy", rating: 4.7, color: "from-amber-500 to-orange-500" },
                { name: "Chami S.", category: "Event Catering", district: "Colombo", rating: 4.9, color: "from-pink-500 to-rose-500" },
              ].map((s) => (
                <div key={s.name} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 hover:border-slate-300 transition">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} text-white grid place-items-center font-black text-sm shrink-0`}>
                    {s.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                    <div className="text-[11px] text-slate-400">{s.category} · {s.district}</div>
                    <div className="text-[11px] text-amber-500 font-bold"><i className="fas fa-star text-[9px] mr-0.5" />{s.rating}</div>
                  </div>
                  <button onClick={() => toast.success(`${s.name} saved!`)} className="w-8 h-8 rounded-full border border-slate-200 text-slate-400 hover:text-rose-400 hover:border-rose-200 hover:bg-rose-50 transition grid place-items-center text-xs">
                    <i className="fas fa-heart" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
