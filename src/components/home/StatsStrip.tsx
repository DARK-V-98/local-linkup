import { usePlatformStats } from "@/hooks/usePlatformStats";

export default function StatsStrip() {
  const {
    loading,
    sellerCount,
    serviceCount,
    categoryCount,
    districtCount,
    averageRating,
    reviewCount,
  } = usePlatformStats();

  // Nothing published yet — a strip of zeros reads worse than no strip at all.
  if (!loading && serviceCount === 0) return null;

  const stats = [
    { icon: "fa-users", value: sellerCount.toLocaleString(), label: sellerCount === 1 ? "Active Seller" : "Active Sellers" },
    { icon: "fa-briefcase", value: serviceCount.toLocaleString(), label: serviceCount === 1 ? "Service Listed" : "Services Listed" },
    { icon: "fa-table-cells-large", value: categoryCount.toLocaleString(), label: "Categories" },
    // Only claim a rating once real reviews exist.
    reviewCount > 0
      ? { icon: "fa-star", value: `${averageRating.toFixed(1)} / 5`, label: "Average Rating" }
      : { icon: "fa-location-dot", value: districtCount.toLocaleString(), label: districtCount === 1 ? "District Covered" : "Districts Covered" },
  ];

  return (
    <section className="container mx-auto">
      <div className="relative bg-slate-900 rounded-[2rem] p-8 md:p-12 overflow-hidden">
        <div className="absolute inset-0 dot-pattern-light opacity-50" />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/30 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-secondary/30 blur-3xl rounded-full" />
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 text-primary-glow">
                <i className={`fas ${s.icon} text-xl leading-none`} />
              </span>
              <div className="text-3xl md:text-4xl font-black text-white mt-3">{loading ? "—" : s.value}</div>
              <div className="text-sm text-slate-400 font-semibold mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
